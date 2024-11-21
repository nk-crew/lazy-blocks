<?php
class Select_Control_Test extends WP_UnitTestCase {
	public function add_test_block( $attrs = array() ) {
		$block_slug = 'lazyblock/test';

		lazyblocks()->add_block( array_merge(
			array(
				'slug' => $block_slug,
			),
			$attrs
		) );

		lazyblocks()->blocks()->register_block_render();
	}

	public function remove_test_block() {
		$block_slug = 'lazyblock/test';

		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( $block_slug ) ) {
			$registry->unregister( $block_slug );
		}

		lazyblocks()->blocks()->remove_block( $block_slug );
	}

	// Remove test block after each test.
	public function tear_down() {
		$this->remove_test_block();

		parent::tear_down();
	}

	public function test_single_value() {
		$this->add_test_block( array(
			'controls' => array(
				'control_select' => array(
					'type' => 'select',
					'name' => 'select',
					'default' => 'one',
					'placement' => 'inspector',
					'choices' => array(
						array(
							'label' => 'One',
							'value' => 'one',
						),
						array(
							'label' => 'Two',
							'value' => 'two',
						),
					),
				),
			),
			'code' => array(
				'frontend_callback' => function( $attributes ) {
					echo $attributes['select'];
				},
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'one' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'val' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"select":"val"} /-->' )
		);
	}

	public function test_multiple_value() {
		$this->add_test_block( array(
			'controls' => array(
				'control_select' => array(
					'type' => 'select',
					'name' => 'select',
					'default' => '',
					'placement' => 'inspector',
					'choices' => array(
						array(
							'label' => 'One',
							'value' => 'one',
						),
						array(
							'label' => 'Two',
							'value' => 'two',
						),
					),
					'allow_null' => 'true',
					'multiple' => 'true',
				),
			),
			'code' => array(
				'frontend_callback' => function( $attributes ) {
					echo 'is array: ' . (is_array($attributes['select']) ? 1 : 0);
					echo 'is empty: ' . (empty($attributes['select']) ? 1 : 0);

					if ( ! empty($attributes['select']) ) {
						echo 'array data: ';

						foreach ( $attributes['select'] as $k => $val ) {
							echo 'k: ' . $k . ' val: ' . $val;
						}
					}
				},
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				'is empty: 1' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				'is empty: 0' .
				'array data: k: 0 val: two' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"select":["two"]} /-->' )
		);
	}
}
