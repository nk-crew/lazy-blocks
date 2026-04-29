<?php
/**
 * Test security fixes for RCE vulnerability (LZB-126).
 */
class SecurityTest extends WP_UnitTestCase {
	/**
	 * Block slugs created during tests that need cleanup.
	 *
	 * @var array
	 */
	private $created_blocks = array();

	/**
	 * Clean up blocks after each test.
	 */
	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();

		foreach ( $this->created_blocks as $block_slug ) {
			lazyblocks()->blocks()->remove_block( $block_slug );
			if ( $registry->is_registered( $block_slug ) ) {
				$registry->unregister( $block_slug );
			}
		}
		$this->created_blocks = array();

		// Reset global flag.
		global $lzb_block_builder_preview;
		$lzb_block_builder_preview = false;

		// Reset WP_Block_Supports.
		if ( class_exists( 'WP_Block_Supports' ) ) {
			WP_Block_Supports::$block_to_render = null;
		}

		parent::tear_down();
	}

	/**
	 * Helper to add a test block and track it for cleanup.
	 *
	 * @param string $slug  Block slug.
	 * @param array  $attrs Block attributes.
	 */
	private function add_test_block( $slug, $attrs = array() ) {
		$this->created_blocks[] = $slug;

		lazyblocks()->add_block(
			array_merge(
				array( 'slug' => $slug ),
				$attrs
			)
		);

		lazyblocks()->blocks()->register_block_render();
	}

	/**
	 * Helper to prepare WP_Block_Supports for render_callback calls.
	 *
	 * @param string $slug Block slug.
	 */
	private function prepare_block_supports( $slug ) {
		if ( class_exists( 'WP_Block_Supports' ) ) {
			WP_Block_Supports::$block_to_render = array(
				'blockName' => $slug,
				'attrs'     => array(),
			);
		}
	}

	/**
	 * Test that saved PHP blocks render correctly regardless of current user capabilities.
	 * This tests that blocks created by admins can be viewed by all users.
	 */
	public function test_saved_php_blocks_render_for_all_users() {
		$block_slug = 'lazyblock/test-php-saved';

		$this->add_test_block(
			$block_slug,
			array(
				'code' => array(
					'output_method'  => 'php',
					'frontend_html'  => '<?php echo "Saved block content"; ?>',
				),
			)
		);

		// Now switch to a contributor user (who cannot create PHP blocks).
		$user_id = $this->factory->user->create( array( 'role' => 'contributor' ) );
		wp_set_current_user( $user_id );

		// Verify contributor does not have unfiltered_html capability.
		$this->assertFalse( current_user_can( 'unfiltered_html' ) );

		// Prepare WP_Block_Supports for render_callback.
		$this->prepare_block_supports( $block_slug );

		// Try to render the saved block - should render successfully.
		// Saved blocks should work for all users, regardless of capabilities.
		$result = lazyblocks()->blocks()->render_callback(
			array( 'lazyblock' => array( 'slug' => $block_slug ) ),
			null,
			null,
			'frontend'
		);

		// Verify that the block rendered successfully.
		$this->assertNotInstanceOf( 'WP_Error', $result );
		$this->assertStringContainsString( 'Saved block content', $result );
	}

	/**
	 * Test that block builder preview blocks PHP execution for users without unfiltered_html.
	 */
	public function test_block_builder_preview_requires_unfiltered_html_capability() {
		// Create a contributor user (does not have unfiltered_html capability).
		$user_id = $this->factory->user->create( array( 'role' => 'contributor' ) );
		wp_set_current_user( $user_id );

		// Verify contributor does not have unfiltered_html capability.
		$this->assertFalse( current_user_can( 'unfiltered_html' ) );

		// Set the global flag to simulate block builder preview context.
		global $lzb_block_builder_preview;
		$lzb_block_builder_preview = true;

		$block_slug = 'lazyblock/test-php-preview';

		$this->add_test_block(
			$block_slug,
			array(
				'code' => array(
					'output_method'  => 'php',
					'frontend_html'  => '<?php echo "This should not execute in preview"; ?>',
				),
			)
		);

		// Prepare WP_Block_Supports for render_callback.
		$this->prepare_block_supports( $block_slug );

		// Try to render the block in preview context - should return WP_Error.
		$result = lazyblocks()->blocks()->render_callback(
			array( 'lazyblock' => array( 'slug' => $block_slug ) ),
			null,
			null,
			'frontend'
		);

		// Verify that PHP execution was blocked in preview context.
		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertEquals( 'lazy_block_cannot_execute_php', $result->get_error_code() );
	}

	/**
	 * Test that administrators with unfiltered_html can execute PHP code.
	 */
	public function test_php_execution_allowed_for_unfiltered_html_users() {
		// Create an administrator user (has unfiltered_html capability in single-site).
		$user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		// Verify administrator has unfiltered_html capability (in single-site installations).
		// In multisite, only super admins have this capability.
		if ( ! is_multisite() ) {
			$this->assertTrue( current_user_can( 'unfiltered_html' ) );

			$block_slug = 'lazyblock/test-php-admin';

			$this->add_test_block(
				$block_slug,
				array(
					'code' => array(
						'output_method'  => 'php',
						'frontend_html'  => '<?php echo "PHP Executed"; ?>',
					),
				)
			);

			// Prepare WP_Block_Supports for render_callback.
			$this->prepare_block_supports( $block_slug );

			// Try to render the block - should execute successfully.
			$result = lazyblocks()->blocks()->render_callback(
				array( 'lazyblock' => array( 'slug' => $block_slug ) ),
				null,
				null,
				'frontend'
			);

			// Verify that PHP execution was allowed.
			$this->assertNotInstanceOf( 'WP_Error', $result );
			$this->assertStringContainsString( 'PHP Executed', $result );
		} else {
			// In multisite, skip this test as regular admins don't have unfiltered_html.
			$this->markTestSkipped( 'Skipping test in multisite environment - only super admins have unfiltered_html capability.' );
		}
	}

	/**
	 * Test that save_meta_boxes blocks PHP code fields for users without unfiltered_html.
	 */
	public function test_save_meta_boxes_blocks_php_code_for_non_privileged_users() {
		// Create a contributor user.
		$user_id = $this->factory->user->create( array( 'role' => 'contributor' ) );
		wp_set_current_user( $user_id );

		// Create a post to save meta to.
		$post_id = $this->factory->post->create( array(
			'post_type' => 'lazyblocks',
		) );

		// Try to save PHP code in editor HTML field.
		$data = array(
			'lazyblocks_code_editor_html'   => '<?php echo "malicious code"; ?>',
			'lazyblocks_code_frontend_html' => '<?php echo "more malicious code"; ?>',
			'lazyblocks_script_view'        => 'alert(1);',
			'lazyblocks_slug'               => 'test-block',
		);

		lazyblocks()->blocks()->save_meta_boxes( $post_id, $data );

		// Verify that the PHP code fields were NOT saved.
		$editor_html     = get_post_meta( $post_id, 'lazyblocks_code_editor_html', true );
		$frontend_html   = get_post_meta( $post_id, 'lazyblocks_code_frontend_html', true );
		$frontend_script = get_post_meta( $post_id, 'lazyblocks_script_view', true );

		$this->assertEmpty( $editor_html, 'Editor HTML should be empty for users without unfiltered_html capability' );
		$this->assertEmpty( $frontend_html, 'Frontend HTML should be empty for users without unfiltered_html capability' );
		$this->assertEmpty( $frontend_script, 'Frontend script should be empty for users without unfiltered_html capability' );

		// Clean up.
		wp_delete_post( $post_id, true );
	}

	/**
	 * Test that direct meta writes cannot bypass code field capability checks.
	 */
	public function test_direct_meta_writes_block_code_fields_for_non_privileged_users() {
		$user_id = $this->factory->user->create( array( 'role' => 'contributor' ) );
		wp_set_current_user( $user_id );

		$post_id = $this->factory->post->create(
			array(
				'post_type' => 'lazyblocks',
			)
		);

		$guarded_meta_keys = array(
			'lazyblocks_code_editor_html',
			'lazyblocks_code_frontend_html',
			'lazyblocks_script_view',
		);

		foreach ( $guarded_meta_keys as $meta_key ) {
			$payload = 'lazyblocks_script_view' === $meta_key ? 'alert(1);' : '<img src=x onerror=alert(1)>';

			$added = add_post_meta( $post_id, $meta_key, $payload, true );

			$this->assertFalse( $added, sprintf( 'Direct add_post_meta should be blocked for %s.', $meta_key ) );
			$this->assertEmpty( get_post_meta( $post_id, $meta_key, true ) );

			add_filter( 'lzb/allow_unfiltered_html', '__return_true' );
			$allowed_add = add_post_meta( $post_id, $meta_key, 'Safe existing template', true );
			remove_filter( 'lzb/allow_unfiltered_html', '__return_true' );

			$this->assertNotFalse( $allowed_add, sprintf( 'Privileged add_post_meta setup should work for %s.', $meta_key ) );

			$updated = update_post_meta( $post_id, $meta_key, $payload );

			$this->assertFalse( $updated, sprintf( 'Direct update_post_meta should be blocked for %s.', $meta_key ) );
			$this->assertSame( 'Safe existing template', get_post_meta( $post_id, $meta_key, true ) );
		}

		wp_delete_post( $post_id, true );
	}
}
