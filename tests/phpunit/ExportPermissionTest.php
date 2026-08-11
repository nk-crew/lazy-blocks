<?php
/**
 * Test export permissions to verify the broken access control vulnerability is fixed.
 *
 * This test ensures that only administrators with 'edit_lazyblocks' capability
 * can export blocks, preventing contributors and other roles from bypassing
 * UI restrictions via direct URL access.
 *
 * Vulnerability Reference:
 * - CVE: Broken Access Control in WordPress Lazy Blocks Plugin
 * - Issue: Contributors could bypass UI restrictions and export blocks via direct URL access
 * - Fix: Changed capability check from 'read_lazyblock' to 'edit_lazyblocks'
 */
class ExportPermissionTest extends WP_UnitTestCase {

	private $admin_user;
	private $contributor_user;
	private $editor_user;
	private $author_user;
	private $test_block_id;

	/**
	 * Set up test users and a test block before running tests.
	 */
	public function setUp(): void {
		parent::setUp();

		// Ensure LazyBlocks plugin is properly initialized
		if ( function_exists( 'lazyblocks' ) ) {
			// Register the lazyblocks post type
			lazyblocks()->blocks()->register_post_type();

			// Add role capabilities properly for test environment
			$this->add_lazyblocks_capabilities();
		}

		// Create test users with different roles
		$this->admin_user = $this->factory->user->create( array( 'role' => 'administrator' ) );
		$this->contributor_user = $this->factory->user->create( array( 'role' => 'contributor' ) );
		$this->editor_user = $this->factory->user->create( array( 'role' => 'editor' ) );
		$this->author_user = $this->factory->user->create( array( 'role' => 'author' ) );

		// Create test lazy block as admin
		wp_set_current_user( $this->admin_user );
		$this->test_block_id = $this->factory->post->create( array(
			'post_type' => 'lazyblocks',
			'post_title' => 'Test Export Block',
			'post_status' => 'publish',
		) );

		// Reset current user
		wp_set_current_user( 0 );
	}

	/**
	 * Clean up after tests.
	 */
	public function tearDown(): void {
		parent::tearDown();

		// Clean up test block
		if ( $this->test_block_id ) {
			wp_delete_post( $this->test_block_id, true );
		}

		// Reset current user
		wp_set_current_user( 0 );

		// From teardown, not from inside the tests: cleanup placed after an
		// assertion is skipped the moment that assertion fails, and a leaked
		// `lazyblocks_export_nonce` would make `maybe_export_json()` fire in
		// whichever unrelated test touches it next.
		$this->clear_export_request();
	}

	/**
	 * Add LazyBlocks capabilities to roles in test environment.
	 */
	private function add_lazyblocks_capabilities() {
		// Get role objects and add capabilities
		$admin_role = get_role( 'administrator' );
		if ( $admin_role ) {
			$admin_role->add_cap( 'edit_lazyblock' );
			$admin_role->add_cap( 'edit_lazyblocks' );
			$admin_role->add_cap( 'read_lazyblock' );
		}

		$editor_role = get_role( 'editor' );
		if ( $editor_role ) {
			$editor_role->add_cap( 'read_lazyblock' );
		}

		$author_role = get_role( 'author' );
		if ( $author_role ) {
			$author_role->add_cap( 'read_lazyblock' );
		}

		$contributor_role = get_role( 'contributor' );
		if ( $contributor_role ) {
			$contributor_role->add_cap( 'read_lazyblock' );
		}
	}

	/**
	 * Runs the real export entry point and returns whatever it wrote.
	 *
	 * The nonce is minted for whoever is the current user, which is the point:
	 * `maybe_export_json()` verifies the nonce and calls `wp_die()` before it
	 * ever reaches the capability check, so a request carrying a fake nonce --
	 * as these tests used to send -- is rejected by CSRF protection and proves
	 * nothing about permissions. Only a nonce the user could genuinely hold
	 * gets far enough to exercise `current_user_can( 'edit_lazyblocks' )`.
	 *
	 * @param int $block_id Block ID to request.
	 * @return string Output produced by the export path; empty when refused.
	 */
	private function request_export( $block_id ) {
		$_GET['lazyblocks_export_block'] = (string) $block_id;
		$_GET['lazyblocks_export_nonce'] = wp_create_nonce( 'lzb-export-blocks-nonce' );

		// Guards the whole point of the exercise: if this ever stops holding,
		// the call below dies at the nonce gate and the permission assertion
		// becomes vacuous again.
		$this->assertNotFalse(
			wp_verify_nonce( $_GET['lazyblocks_export_nonce'], 'lzb-export-blocks-nonce' ),
			'The test must reach the capability check, not stop at the nonce gate'
		);

		// Keep an *allowed* export from die()ing mid-suite: with the terminator
		// suppressed, export_json() returns after echoing, so the admin test
		// receives JSON and a capability regression fails an assertion instead
		// of killing the PHPUnit process.
		add_filter( 'lzb/export_json/die', '__return_false' );

		ob_start();

		try {
			lazyblocks()->tools()->maybe_export_json();
		} finally {
			// The buffer must close on the exception path too, or it swallows
			// all later output, PHPUnit's own reporting included.
			$output = ob_get_clean();
			remove_filter( 'lzb/export_json/die', '__return_false' );
		}

		return $output;
	}

	/**
	 * Clears the request state the export tests set.
	 */
	private function clear_export_request() {
		unset(
			$_GET['lazyblocks_export_block'],
			$_GET['lazyblocks_export_nonce']
		);
	}

	/**
	 * Test that administrators can export blocks.
	 */
	public function test_admin_can_export_blocks() {
		wp_set_current_user( $this->admin_user );

		// Precondition, so a role-configuration problem reads as itself rather
		// than as an export failure.
		$this->assertTrue(
			current_user_can( 'edit_lazyblocks' ),
			'Administrator should have edit_lazyblocks capability'
		);

		// The suite's positive control. Every other test asserts the export
		// produced nothing -- and nothing is also what a broken harness
		// produces, so without this test a renamed query parameter or an early
		// return would turn the whole file green while it asserts nothing.
		$output = $this->request_export( $this->test_block_id );

		$decoded = json_decode( $output, true );

		$this->assertIsArray(
			$decoded,
			'An administrator with a valid nonce must receive export JSON'
		);
		$this->assertCount(
			1,
			$decoded,
			'The export must contain exactly the requested block'
		);
		$this->assertSame(
			$this->test_block_id,
			$decoded[0]['id'],
			'The export must contain the block the request named'
		);
	}

	/**
	 * Test that contributors cannot export blocks (core vulnerability test).
	 */
	public function test_contributor_cannot_export_blocks() {
		wp_set_current_user( $this->contributor_user );

		// Verify contributor does NOT have the required capability
		$this->assertFalse(
			current_user_can( 'edit_lazyblocks' ),
			'Contributor should NOT have edit_lazyblocks capability'
		);

		// Verify contributor still has read capability (the old vulnerable check)
		$this->assertTrue(
			current_user_can( 'read_lazyblock' ),
			'Contributor should have read_lazyblock capability'
		);

		// The regression guard. Everything above asserts how WordPress assigns
		// roles; only this runs the plugin's export path and proves it refuses.
		// Revert the check in `maybe_export_json()` to `read_lazyblock` -- the
		// original vulnerability -- and this is the assertion that fails.
		$output = $this->request_export( $this->test_block_id );

		$this->assertSame(
			'',
			$output,
			'A contributor holding a valid nonce must receive no export output'
		);
	}

	/**
	 * The CSRF gate: a request without a valid nonce is refused outright.
	 *
	 * This replaces a version that issued a real `wp_remote_get` to `admin_url()`
	 * and wrapped every assertion in `if ( ! is_wp_error( $response ) )`, so a
	 * request that could not be made at all -- the normal case inside the test
	 * container -- skipped the whole body and reported success. It also sent an
	 * invalid nonce while claiming to test permissions, which is the nonce gate,
	 * not the capability gate.
	 *
	 * Both gates are now covered, separately and for real: this one, and
	 * `test_contributor_cannot_export_blocks` above, which carries a nonce the
	 * contributor genuinely holds so that execution reaches the capability check.
	 */
	public function test_export_without_a_valid_nonce_is_refused() {
		wp_set_current_user( $this->contributor_user );

		$_GET['lazyblocks_export_block'] = (string) $this->test_block_id;
		$_GET['lazyblocks_export_nonce'] = 'invalid_nonce_contributor';

		// `wp_die()` is swapped for a thrower by the test case, so this is the
		// observable form of "Export permission denied". `tearDown()` clears
		// the request state.
		$this->expectException( WPDieException::class );

		lazyblocks()->tools()->maybe_export_json();
	}

	/**
	 * Test that all non-admin roles are blocked from export.
	 */
	public function test_all_non_admin_roles_blocked_from_export() {
		$roles_to_test = array(
			'contributor' => $this->contributor_user,
			'editor' => $this->editor_user,
			'author' => $this->author_user,
		);

		foreach ( $roles_to_test as $role_name => $user_id ) {
			wp_set_current_user( $user_id );

			$output = $this->request_export( $this->test_block_id );

			$this->assertSame(
				'',
				$output,
				"User with role '{$role_name}' must receive no export output"
			);
		}
	}
}
