<?php
class WpmlTest extends WP_UnitTestCase {
	public function test_only_top_level_repeaters_have_json_encoding() {
		$wpml = new LazyBlocks_WPML();
		$data = $wpml->get_translated_controls_data(
			array(
				'outer' => array(
					'type'     => 'repeater',
					'name'     => 'rows',
					'child_of' => '',
				),
				'inner' => array(
					'type'     => 'repeater',
					'name'     => 'items',
					'child_of' => 'outer',
				),
				'deep' => array(
					'type'     => 'repeater',
					'name'     => 'details',
					'child_of' => 'inner',
				),
				'text' => array(
					'type'      => 'text',
					'name'      => 'heading',
					'child_of'  => 'deep',
					'translate' => 'true',
				),
				'layout' => array(
					'type'      => 'select',
					'name'      => 'layout',
					'child_of'  => 'deep',
					'translate' => 'false',
				),
			)
		);

		$this->assertCount( 1, $data );
		$this->assertSame( array( 'name' => 'rows', 'encoding' => 'json' ), $data[0]['attr'] );
		$this->assertSame( '*', $data[0]['key']['attr']['name'] );
		$inner = $data[0]['key']['key'];
		$this->assertCount( 1, $inner );
		$this->assertSame( array( 'name' => 'items' ), $inner[0]['attr'] );
		$this->assertSame( '*', $inner[0]['key']['attr']['name'] );
		$deep = $inner[0]['key']['key'];
		$this->assertCount( 1, $deep );
		$this->assertSame( array( 'name' => 'details' ), $deep[0]['attr'] );
		$this->assertSame( '*', $deep[0]['key']['attr']['name'] );
		$this->assertSame(
			array(
				array(
					'value' => '',
					'attr'  => array( 'name' => 'heading' ),
				),
			),
			$deep[0]['key']['key']
		);
	}

	// The WPML config of one block, or null when the block is not declared.
	private function get_block_config( $block_slug ) {
		$wpml   = new LazyBlocks_WPML();
		$config = $wpml->wpml_config_array(
			array(
				'wpml-config' => array(
					'gutenberg-blocks' => array(
						'gutenberg-block' => array(),
					),
				),
			)
		);

		foreach ( $config['wpml-config']['gutenberg-blocks']['gutenberg-block'] as $block_config ) {
			if ( $block_slug === $block_config['attr']['type'] ) {
				return $block_config;
			}
		}

		return null;
	}

	// A block with a translatable control is declared with its controls.
	public function test_block_with_translatable_control() {
		$block_slug = 'lazyblock/test-wpml-translate';

		lazyblocks()->add_block( array(
			'slug'     => $block_slug,
			'controls' => array(
				'control_1' => array(
					'type'      => 'text',
					'name'      => 'heading',
					'child_of'  => '',
					'translate' => 'true',
				),
				'control_2' => array(
					'type'      => 'select',
					'name'      => 'layout',
					'child_of'  => '',
					'translate' => 'false',
				),
			),
		) );

		$block_config = $this->get_block_config( $block_slug );

		$this->assertNotNull( $block_config );
		$this->assertEquals( '1', $block_config['attr']['translate'] );
		$this->assertEquals( 'heading', $block_config['key'][0]['attr']['name'] );
		$this->assertEquals( 1, count( $block_config['key'] ) );

		lazyblocks()->blocks()->remove_block( $block_slug );
	}

	// A block with no translatable control is declared with translate="0",
	// so WPML does not offer its attributes for translation.
	public function test_block_without_translatable_control() {
		$block_slug = 'lazyblock/test-wpml-no-translate';

		lazyblocks()->add_block( array(
			'slug'     => $block_slug,
			'controls' => array(
				'control_1' => array(
					'type'      => 'select',
					'name'      => 'layout',
					'child_of'  => '',
					'translate' => 'false',
				),
			),
		) );

		$block_config = $this->get_block_config( $block_slug );

		$this->assertNotNull( $block_config );
		$this->assertEquals( '0', $block_config['attr']['translate'] );
		$this->assertArrayNotHasKey( 'key', $block_config );

		lazyblocks()->blocks()->remove_block( $block_slug );
	}
}
