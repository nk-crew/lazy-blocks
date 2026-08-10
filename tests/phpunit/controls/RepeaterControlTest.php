<?php
class RepeaterControlTest extends WP_UnitTestCase {
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

	// Register a block gated on a Repeater control with a single text child control.
	public function register_repeater_block() {
		$this->add_test_block( array(
			'controls' => array(
				'control_repeater' => array(
					'type' => 'repeater',
					'name' => 'my_repeater',
					'placement' => 'content',
				),
				'control_text' => array(
					'type' => 'text',
					'name' => 'text',
					'default' => '',
					'child_of' => 'control_repeater',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_callback' => function( $attributes ) {
					echo 'is array: ' . ( is_array( $attributes['my_repeater'] ) ? 1 : 0 );

					if ( ! empty( $attributes['my_repeater'] ) && is_array( $attributes['my_repeater'] ) ) {
						foreach ( $attributes['my_repeater'] as $row ) {
							echo ' text: ' . $row['text'];
						}
					}
				},
			),
		) );
	}

	// The empty default (`%5B%5D`) should decode to an empty array, not break the render.
	public function test_default_value() {
		$this->register_repeater_block();

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);
	}

	// The URL-encoded JSON string form produced by the editor must keep working (no regression).
	public function test_encoded_string_value() {
		$this->register_repeater_block();

		$encoded = rawurlencode( wp_json_encode( array(
			array( 'text' => 'a' ),
			array( 'text' => 'b' ),
			array( 'text' => 'c' ),
		) ) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				' text: a' .
				' text: b' .
				' text: c' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"my_repeater":"' . $encoded . '"} /-->' )
		);
	}

	// A Repeater value authored in the block markup as a raw JSON array must survive
	// `WP_Block_Type::prepare_attributes_for_render()` and reach the render callback.
	public function test_raw_array_value() {
		$this->register_repeater_block();

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				' text: a' .
				' text: b' .
				' text: c' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"my_repeater":[{"text":"a"},{"text":"b"},{"text":"c"}]} /-->' )
		);
	}

	// A meta Repeater must keep a single scalar type, `register_meta()` does not accept a union.
	public function test_meta_backed_repeater_keeps_scalar_type() {
		$this->add_test_block( array(
			'controls' => array(
				'control_repeater' => array(
					'type' => 'repeater',
					'name' => 'my_repeater',
					'save_in_meta' => 'true',
					'placement' => 'content',
				),
			),
		) );

		$block           = lazyblocks()->blocks()->get_block( 'lazyblock/test' );
		$meta_attributes = lazyblocks()->blocks()->prepare_block_meta_attributes( $block['controls'], '', $block );

		$this->assertSame( 'string', $meta_attributes['my_repeater']['type'] );
	}
}
