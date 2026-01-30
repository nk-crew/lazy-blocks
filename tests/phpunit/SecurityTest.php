<?php
/**
 * Test security fixes for RCE vulnerability (LZB-126).
 */
class SecurityTest extends WP_UnitTestCase {
	/**
	 * Test that saved PHP blocks render correctly regardless of current user capabilities.
	 * This tests that blocks created by admins can be viewed by all users.
	 */
	public function test_saved_php_blocks_render_for_all_users() {
		// Create a block with PHP output (simulating it was created by an admin).
		$block_slug = 'lazyblock/test-php-saved';
		lazyblocks()->add_block( array(
			'slug' => $block_slug,
			'code' => array(
				'output_method'  => 'php',
				'frontend_html'  => '<?php echo "Saved block content"; ?>',
			),
		) );

		lazyblocks()->blocks()->register_block_render();

		// Now switch to a contributor user (who cannot create PHP blocks).
		$user_id = $this->factory->user->create( array( 'role' => 'contributor' ) );
		wp_set_current_user( $user_id );

		// Verify contributor does not have unfiltered_html capability.
		$this->assertFalse( current_user_can( 'unfiltered_html' ) );

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

		// Clean up.
		lazyblocks()->blocks()->remove_block( $block_slug );
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( $block_slug ) ) {
			$registry->unregister( $block_slug );
		}
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

		// Create a block with PHP output.
		$block_slug = 'lazyblock/test-php-preview';
		lazyblocks()->add_block( array(
			'slug' => $block_slug,
			'code' => array(
				'output_method'  => 'php',
				'frontend_html'  => '<?php echo "This should not execute in preview"; ?>',
			),
		) );

		lazyblocks()->blocks()->register_block_render();

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

		// Clean up.
		$lzb_block_builder_preview = false;
		lazyblocks()->blocks()->remove_block( $block_slug );
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( $block_slug ) ) {
			$registry->unregister( $block_slug );
		}
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

			// Create a block with PHP output.
			$block_slug = 'lazyblock/test-php-admin';
			lazyblocks()->add_block( array(
				'slug' => $block_slug,
				'code' => array(
					'output_method'  => 'php',
					'frontend_html'  => '<?php echo "PHP Executed"; ?>',
				),
			) );

			lazyblocks()->blocks()->register_block_render();

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

			// Clean up.
			lazyblocks()->blocks()->remove_block( $block_slug );
			$registry = WP_Block_Type_Registry::get_instance();
			if ( $registry->is_registered( $block_slug ) ) {
				$registry->unregister( $block_slug );
			}
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
			'lazyblocks_slug'               => 'test-block',
		);

		lazyblocks()->blocks()->save_meta_boxes( $post_id, $data );

		// Verify that the PHP code fields were NOT saved.
		$editor_html   = get_post_meta( $post_id, 'lazyblocks_code_editor_html', true );
		$frontend_html = get_post_meta( $post_id, 'lazyblocks_code_frontend_html', true );

		$this->assertEmpty( $editor_html, 'Editor HTML should be empty for users without unfiltered_html capability' );
		$this->assertEmpty( $frontend_html, 'Frontend HTML should be empty for users without unfiltered_html capability' );

		// Clean up.
		wp_delete_post( $post_id, true );
	}
}
