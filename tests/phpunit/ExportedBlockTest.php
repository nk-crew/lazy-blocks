<?php
/**
 * A block exported from the Tools page as PHP and pasted into a theme or plugin.
 */
class ExportedBlockTest extends WP_UnitTestCase {
	public function set_up() {
		parent::set_up();

		// Saving block code needs unfiltered_html.
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		lazyblocks()->blocks()->clear_blocks_cache();
	}

	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();

		if ( $registry->is_registered( 'lazyblock/exported' ) ) {
			$registry->unregister( 'lazyblock/exported' );
		}

		lazyblocks()->blocks()->remove_block( 'lazyblock/exported' );
		lazyblocks()->blocks()->clear_blocks_cache();

		parent::tear_down();
	}

	// The export wraps add_block() in lzb/init, which core fires on init 5, ahead of the
	// registration on init 20.
	public function test_lzb_init_fires_before_blocks_are_registered() {
		$this->assertSame( 5, has_action( 'init', array( lazyblocks(), 'init_hook' ) ) );
		$this->assertSame( 20, has_action( 'init', array( lazyblocks()->blocks(), 'register_block' ) ) );
		$this->assertSame( 20, has_action( 'init', array( lazyblocks()->blocks(), 'register_block_render' ) ) );
	}

	public function test_exported_block_registers_and_renders_from_php() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_status' => 'publish',
				'post_title'  => 'Exported',
			)
		);
		lazyblocks()->blocks()->save_meta_boxes(
			$post_id,
			array(
				'lazyblocks_slug'               => 'exported',
				'lazyblocks_code_frontend_html' => '<p>{{message}}</p>',
				'lazyblocks_controls'           => array(
					'control_1' => array(
						'type'      => 'text',
						'name'      => 'message',
						'label'     => 'Message',
						'placement' => 'content',
					),
				),
			)
		);
		lazyblocks()->blocks()->clear_blocks_cache();

		// The Tools page code, as tools.js assembles it.
		$code = "add_action( 'lzb/init', function() {\n"
			. lazyblocks()->tools()->get_block_php_string_code( lazyblocks()->blocks()->get_block( 'lazyblock/exported', true ) )
			. "\n} );";

		// The site then removes the builder block and pastes the code into a theme or plugin.
		wp_delete_post( $post_id, true );
		lazyblocks()->blocks()->clear_blocks_cache();
		$this->assertNull( lazyblocks()->blocks()->get_block( 'lazyblock/exported' ) );

		// phpcs:ignore Squiz.PHP.Eval.Discouraged
		eval( $code );
		do_action( 'lzb/init' );
		lazyblocks()->blocks()->register_block_render();

		$block = lazyblocks()->blocks()->get_block( 'lazyblock/exported' );

		$this->assertSame( 'Exported', $block['title'] );
		$this->assertSame( '<p>{{message}}</p>', $block['code']['frontend_html'] );
		$this->assertSame( 'message', $block['controls']['control_1']['name'] );
		$this->assertTrue( WP_Block_Type_Registry::get_instance()->is_registered( 'lazyblock/exported' ) );
		$this->assertSame(
			'<div class="wp-block-lazyblock-exported"><p>hi</p></div>',
			do_blocks( '<!-- wp:lazyblock/exported {"message":"hi"} /-->' )
		);
	}
}
