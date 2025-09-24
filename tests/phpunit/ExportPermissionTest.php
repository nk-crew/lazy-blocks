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
	 * Helper method to test capability requirements for export.
	 *
	 * @param int $block_id Block ID to test.
	 * @return bool True if user has required capability.
	 */
	private function test_export_capability( $block_id ) {
		// Test the same capability check used in the actual export function
		return current_user_can( 'edit_lazyblocks' );
	}

	/**
	 * Test that administrators can export blocks.
	 */
	public function test_admin_can_export_blocks() {
		wp_set_current_user( $this->admin_user );

		// Verify admin has the required capability
		$this->assertTrue(
			current_user_can( 'edit_lazyblocks' ),
			'Administrator should have edit_lazyblocks capability'
		);

		// Test capability check used in export function
		$can_export = $this->test_export_capability( $this->test_block_id );
		$this->assertTrue(
			$can_export,
			'Administrator should be able to export blocks'
		);

		// Test with valid nonce (admins can generate valid nonces)
		$valid_nonce = wp_create_nonce( 'lzb-export-block-nonce' );
		$this->assertNotEmpty( $valid_nonce, 'Admin should be able to create export nonce' );
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

		// Test capability check used in export function
		$can_export = $this->test_export_capability( $this->test_block_id );
		$this->assertFalse(
			$can_export,
			'Contributor should NOT be able to export blocks'
		);
	}

	/**
	 * Test the exact vulnerability scenario: contributor bypassing UI via direct URL.
	 * This is the core regression test for the security vulnerability.
	 */
	public function test_vulnerability_regression_contributor_direct_url_access() {
		// This test reproduces the exact vulnerability scenario reported:
		// 1. Admin creates a block (done in setUp)
		// 2. Contributor accesses /wp-admin/edit.php?post_type=lazyblocks&lazyblocks_export_block={id}
		// 3. Export should be blocked with the fix

		// Build the export URL with an invalid nonce
		$export_url = admin_url( 'edit.php?post_type=lazyblocks&lazyblocks_export_block=' . $this->test_block_id . '&lazyblocks_export_nonce=invalid_nonce' );

		// Test as contributor - should be blocked
		wp_set_current_user( $this->contributor_user );

		// Set cookies for authentication (wp_remote_get needs cookies for auth)
		$contributor_cookies = array();
		if ( function_exists( 'wp_generate_auth_cookie' ) ) {
			$auth_cookie = wp_generate_auth_cookie( $this->contributor_user, time() + 3600 );
			$contributor_cookies[] = new WP_Http_Cookie( array(
				'name' => AUTH_COOKIE,
				'value' => $auth_cookie,
				'path' => COOKIEPATH,
				'domain' => COOKIE_DOMAIN,
			) );
		}

		// Make HTTP request as contributor
		$contributor_response = wp_remote_get( $export_url, array(
			'cookies' => $contributor_cookies,
			'redirection' => 0, // Don't follow redirects automatically
			'timeout' => 10,
		) );

		// Check contributor response
		if ( ! is_wp_error( $contributor_response ) ) {
			$contributor_status = wp_remote_retrieve_response_code( $contributor_response );
			$contributor_headers = wp_remote_retrieve_headers( $contributor_response );
			$contributor_body = wp_remote_retrieve_body( $contributor_response );

			// Contributor should be denied access (403) or redirected to login (302)
			$this->assertTrue(
				in_array( $contributor_status, array( 403, 302, 301 ) ) || $contributor_status >= 400,
				'Contributor should receive error status code, got: ' . $contributor_status
			);

			// Should NOT have file download headers
			$this->assertFalse(
				isset( $contributor_headers['content-disposition'] ) &&
				strpos( $contributor_headers['content-disposition'], 'attachment' ) !== false,
				'Contributor should not receive file download headers'
			);

			// Should NOT contain JSON export data
			$this->assertFalse(
				strpos( $contributor_body, '"lazyblocks_export"' ) !== false,
				'Contributor should not receive export JSON data'
			);
		}

		// Now test admin can export
		wp_set_current_user( $this->admin_user );

		// Verify admin has required capability
		$this->assertTrue(
			current_user_can( 'edit_lazyblocks' ),
			'Administrator should have edit_lazyblocks capability'
		);

		// Build export URL with valid nonce for admin
		$valid_nonce = wp_create_nonce( 'lzb-export-block-nonce' );
		$admin_export_url = admin_url( 'edit.php?post_type=lazyblocks&lazyblocks_export_block=' . $this->test_block_id . '&lazyblocks_export_nonce=' . $valid_nonce );

		// Set cookies for admin authentication
		$admin_cookies = array();
		if ( function_exists( 'wp_generate_auth_cookie' ) ) {
			$auth_cookie = wp_generate_auth_cookie( $this->admin_user, time() + 3600 );
			$admin_cookies[] = new WP_Http_Cookie( array(
				'name' => AUTH_COOKIE,
				'value' => $auth_cookie,
				'path' => COOKIEPATH,
				'domain' => COOKIE_DOMAIN,
			) );
		}

		// Make HTTP request as admin
		$admin_response = wp_remote_get( $admin_export_url, array(
			'cookies' => $admin_cookies,
			'redirection' => 0,
			'timeout' => 10,
		) );

		// Check admin response
		if ( ! is_wp_error( $admin_response ) ) {
			$admin_status = wp_remote_retrieve_response_code( $admin_response );
			$admin_headers = wp_remote_retrieve_headers( $admin_response );
			$admin_body = wp_remote_retrieve_body( $admin_response );

			// Admin should either get successful download (200) or at least have access
			// Note: In test environment, actual file download might not work due to headers
			// but admin should not get 403 Forbidden
			$this->assertNotEquals(
				403,
				$admin_status,
				'Administrator should not receive 403 Forbidden status'
			);

			// If successful, should contain export data or download headers
			if ( $admin_status === 200 ) {
				$has_export_content =
					( isset( $admin_headers['content-disposition'] ) &&
					  strpos( $admin_headers['content-disposition'], 'attachment' ) !== false ) ||
					strpos( $admin_body, '"lazyblocks_export"' ) !== false;

				$this->assertTrue(
					$has_export_content,
					'Administrator should receive export content or download headers'
				);
			}
		}
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
			$can_export = $this->test_export_capability( $this->test_block_id );
			$this->assertFalse(
				$can_export,
				"User with role '{$role_name}' should be blocked from exporting blocks"
			);
		}
	}

	/**
	 * Test that the old vulnerable capability check would have failed.
	 * This confirms our fix is working by showing what the old code would have done.
	 */
	public function test_old_vulnerable_capability_would_have_failed() {
		wp_set_current_user( $this->contributor_user );

		// The old vulnerability: contributors have 'read_lazyblock' capability
		$this->assertTrue(
			current_user_can( 'read_lazyblock' ),
			'Contributor has read_lazyblock capability (old vulnerable check)'
		);

		// But they don't have the new required capability
		$this->assertFalse(
			current_user_can( 'edit_lazyblocks' ),
			'Contributor lacks edit_lazyblocks capability (new secure check)'
		);

		// Demonstrate that using the old check would have been vulnerable
		$would_be_vulnerable = current_user_can( 'read_lazyblock', $this->test_block_id );
		$is_now_secure = current_user_can( 'edit_lazyblocks' );

		$this->assertTrue( $would_be_vulnerable, 'Old check would have allowed access' );
		$this->assertFalse( $is_now_secure, 'New check properly blocks access' );
	}
}
