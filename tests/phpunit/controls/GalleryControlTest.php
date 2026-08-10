<?php
class GalleryControlTest extends WP_UnitTestCase {
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

	// Register a block gated on a single Gallery control.
	public function register_gallery_block() {
		$this->add_test_block( array(
			'controls' => array(
				'control_gallery' => array(
					'type' => 'gallery',
					'name' => 'my_gallery',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_callback' => function( $attributes ) {
					$value = $attributes['my_gallery'] ?? null;

					echo 'is array: ' . ( is_array( $value ) ? 1 : 0 );

					if ( ! empty( $value ) && is_array( $value ) ) {
						foreach ( $value as $image ) {
							echo ' url: ' . $image['url'];
						}
					}
				},
			),
		) );
	}

	// No value in the block markup should not break the render.
	public function test_default_value() {
		$this->register_gallery_block();

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 0' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);
	}

	// The URL-encoded JSON string form produced by the editor must keep working (no regression).
	public function test_encoded_string_value() {
		$this->register_gallery_block();

		$encoded = rawurlencode( wp_json_encode( array(
			array( 'url' => 'https://example.com/a.jpg' ),
			array( 'url' => 'https://example.com/b.jpg' ),
		) ) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				' url: https://example.com/a.jpg' .
				' url: https://example.com/b.jpg' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"my_gallery":"' . $encoded . '"} /-->' )
		);
	}

	// Removing every image in the editor stores an encoded empty array (`onChange( [] )`), which
	// must still pass the widened schema instead of being dropped.
	public function test_empty_array_value() {
		$this->register_gallery_block();

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"my_gallery":"%5B%5D"} /-->' )
		);
	}

	// A Gallery value authored in the block markup as a raw JSON array must survive
	// `WP_Block_Type::prepare_attributes_for_render()` and reach the render callback.
	public function test_raw_array_value() {
		$this->register_gallery_block();

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'is array: 1' .
				' url: https://example.com/a.jpg' .
				' url: https://example.com/b.jpg' .
			'</div>',
			do_blocks( '<!-- wp:lazyblock/test {"my_gallery":[{"url":"https://example.com/a.jpg"},{"url":"https://example.com/b.jpg"}]} /-->' )
		);
	}

	// A meta Gallery must keep a single scalar type, `register_meta()` does not accept a union.
	public function test_meta_backed_gallery_keeps_scalar_type() {
		$this->add_test_block( array(
			'controls' => array(
				'control_gallery' => array(
					'type' => 'gallery',
					'name' => 'my_gallery',
					'save_in_meta' => 'true',
					'placement' => 'content',
				),
			),
		) );

		$block           = lazyblocks()->blocks()->get_block( 'lazyblock/test' );
		$meta_attributes = lazyblocks()->blocks()->prepare_block_meta_attributes( $block['controls'], '', $block );

		$this->assertSame( 'string', $meta_attributes['my_gallery']['type'] );
	}
}
