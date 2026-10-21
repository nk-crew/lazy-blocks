<?php
/**
 * Block supports stored by the builder reach the registered block type.
 */
class BlockSupportsTest extends WP_UnitTestCase {

	private $block_id;

	public function set_up() {
		parent::set_up();

		lazyblocks()->blocks()->register_post_type();

		$this->block_id = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_title'  => 'Supports Block',
				'post_status' => 'publish',
			)
		);
	}

	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( 'lazyblock/supports-block' ) ) {
			$registry->unregister( 'lazyblock/supports-block' );
		}

		wp_set_current_user( 0 );
		lazyblocks()->blocks()->clear_blocks_cache();

		parent::tear_down();
	}

	private function save_block( $meta ) {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		lazyblocks()->blocks()->save_meta_boxes(
			$this->block_id,
			array_merge( array( 'lazyblocks_slug' => 'supports-block' ), $meta )
		);
		lazyblocks()->blocks()->clear_blocks_cache();

		return lazyblocks()->blocks()->get_block( 'lazyblock/supports-block', true );
	}

	public function test_new_supports_are_off_by_default() {
		$block = $this->save_block( array() );

		$this->assertFalse( $block['supports']['__experimentalBorder'] );
		$this->assertFalse( $block['supports']['border'] );
		$this->assertFalse( $block['supports']['background'] );
		$this->assertFalse( $block['supports']['filter'] );
		$this->assertFalse( $block['supports']['position'] );
		$this->assertFalse( $block['supports']['interactivity'] );
	}

	public function test_stored_supports_pass_through() {
		$border = array(
			'color'  => true,
			'radius' => true,
			'style'  => false,
			'width'  => true,
		);

		$block = $this->save_block(
			array(
				'lazyblocks_supports_border'        => $border,
				'lazyblocks_supports_background'    => array(
					'backgroundImage' => true,
					'backgroundSize'  => false,
				),
				'lazyblocks_supports_filter'        => array( 'duotone' => true ),
				'lazyblocks_supports_position'      => array( 'sticky' => true ),
				'lazyblocks_supports_interactivity' => true,
				'lazyblocks_supports_typography'    => array(
					'fontSize'    => true,
					'textShadow'  => true,
					'textColumns' => true,
				),
				'lazyblocks_supports_dimensions'    => array(
					'width'  => true,
					'height' => true,
				),
			)
		);

		$this->assertSame( $border, $block['supports']['__experimentalBorder'] );
		$this->assertSame( $border, $block['supports']['border'] );
		$this->assertSame(
			array(
				'backgroundImage' => true,
				'backgroundSize'  => false,
			),
			$block['supports']['background']
		);
		$this->assertSame( array( 'duotone' => true ), $block['supports']['filter'] );
		$this->assertSame( array( 'sticky' => true ), $block['supports']['position'] );
		$this->assertTrue( $block['supports']['interactivity'] );
		$this->assertTrue( $block['supports']['typography']['textShadow'] );
		$this->assertTrue( $block['supports']['typography']['textColumns'] );
		$this->assertTrue( $block['supports']['dimensions']['width'] );
		$this->assertTrue( $block['supports']['dimensions']['height'] );
	}

	public function test_border_support_renders_core_styles_on_frontend() {
		$this->save_block(
			array(
				'lazyblocks_code_frontend_html' => '<p useBlockProps>Bordered</p>',
				'lazyblocks_supports_border'    => array(
					'color'  => true,
					'radius' => true,
					'style'  => true,
					'width'  => true,
				),
			)
		);
		lazyblocks()->blocks()->register_block_render();

		$output = do_blocks( '<!-- wp:lazyblock/supports-block {"style":{"border":{"color":"#ff0000","width":"3px","style":"dashed"}}} /-->' );

		$this->assertStringContainsString( 'has-border-color', $output );
		$this->assertStringContainsString( 'border-color:#ff0000', $output );
		$this->assertStringContainsString( 'border-width:3px', $output );
		$this->assertStringContainsString( 'border-style:dashed', $output );
		$this->assertStringContainsString( '>Bordered</p>', $output );
	}
}
