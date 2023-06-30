<?php
class Block_Render_Test extends WP_UnitTestCase {
	public function add_test_block( $attrs = array() ) {
		lazyblocks()->add_block( array_merge( array(
			'title' => 'Test Block',
			'slug' => 'lazyblock/test',
		), $attrs ) );

		lazyblocks()->blocks()->register_block_render();
	}

	public function remove_test_block() {
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( 'lazyblock/test' ) ) {
			$registry->unregister( 'lazyblock/test' );
		}

		lazyblocks()->blocks()->remove_block( 'lazyblock/test' );
	}

	public function test_simple_block_render() {
		$this->add_test_block( array(
			'code' => array(
				'frontend_html' => '<p>Test</p>',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test"><p>Test</p></div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);

		$this->remove_test_block();
	}

	public function test_block_render_attributes() {
		$this->add_test_block( array(
			'supports' => array(
				'customClassName' => true,
				'anchor' => true,
			),
			'code' => array(
				'frontend_html' => '<p>Test</p>',
			),
		) );

		$this->assertEquals(
			'<div class="test-class wp-block-lazyblock-test" id="test-id"><p>Test</p></div>',
			do_blocks( '<!-- wp:lazyblock/test {"anchor":"test-id","className":"test-class"} /-->' )
		);

		$this->remove_test_block();
	}

	public function test_block_render_controls() {
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'text',
					'name' => 'text-control',
				),
			),
			'code' => array(
				'frontend_html' => '<p>{{text-control}}</p>',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test"><p>text control val</p></div>',
			do_blocks( '<!-- wp:lazyblock/test {"text-control":"text control val"} /-->' )
		);

		$this->remove_test_block();
	}

	public function test_block_render_inner_blocks_component() {
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'inner_blocks',
					'name' => 'inner-content',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_html' => '<p>Test</p><InnerBlocks />',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Test</p>' .
				'<div class="lazyblock-inner-blocks"><p>Inner</p></div>' .
			'</div>',
			do_blocks(
				'<!-- wp:lazyblock/test -->' .
					'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
				'<!-- /wp:lazyblock/test -->'
			)
		);

		$this->remove_test_block();

		/**
		 * Should render custom class in the inner blocks wrapper.
		 */
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'inner_blocks',
					'name' => 'inner-content',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_html' => '<p>Test</p><InnerBlocks className="custom-class" />',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Test</p>' .
				'<div class="custom-class"><p>Inner</p></div>' .
			'</div>',
			do_blocks(
				'<!-- wp:lazyblock/test -->' .
					'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
				'<!-- /wp:lazyblock/test -->'
			)
		);

		$this->remove_test_block();

		/**
		 * Should not render inner blocks wrapper.
		 */
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'inner_blocks',
					'name' => 'inner-content',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_html' => '<p>Test</p><InnerBlocks className="custom-class" />',
			),
		) );

		add_filter( 'lzb/block_render/allow_inner_blocks_wrapper', '__return_false' );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Test</p>' .
				'<p>Inner</p>' .
			'</div>',
			do_blocks(
				'<!-- wp:lazyblock/test -->' .
					'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
				'<!-- /wp:lazyblock/test -->'
			)
		);

		$this->remove_test_block();

		remove_filter( 'lzb/block_render/allow_inner_blocks_wrapper', '__return_false' );
	}

	public function test_block_render_deprecated_inner_blocks_control() {
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'inner_blocks',
					'name' => 'inner-content',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_html' => '<p>Test</p>{{{inner-content}}}',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Test</p>' .
				'<p>Inner</p>' .
			'</div>',
			do_blocks(
				'<!-- wp:lazyblock/test -->' .
					'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
				'<!-- /wp:lazyblock/test -->'
			)
		);

		$this->remove_test_block();
	}
}
