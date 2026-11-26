<?php
class BlockRenderTest extends WP_UnitTestCase {
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

	/**
	 * Strip WP core block classes (e.g. wp-block-paragraph) that vary
	 * between WordPress versions so assertions stay version-agnostic.
	 */
	private function normalize_block_html( $html ) {
		return preg_replace( '/ class="wp-block-paragraph"/', '', $html );
	}

	// Remove test block after each test.
	public function tear_down() {
		$this->remove_test_block();

		parent::tear_down();
	}

	/**
	 * @dataProvider legacy_wrapper_hooks
	 */
	public function test_legacy_wrapper_filter_preserves_multiple_roots( $hook ) {
		$this->add_test_block( array( 'code' => array( 'frontend_html' => '<p>First</p><p>Second</p>' ) ) );
		$this->setExpectedDeprecated( $hook );
		add_filter( $hook, '__return_false' );

		try {
			$this->assertSame( '<p>First</p><p>Second</p>', do_blocks( '<!-- wp:lazyblock/test /-->' ) );
		} finally {
			remove_filter( $hook, '__return_false' );
		}
	}

	public static function legacy_wrapper_hooks() {
		return array(
			array( 'lzb/block_render/allow_wrapper' ),
			array( 'lazyblock/test/frontend_allow_wrapper' ),
			array( 'lazyblock/test/allow_wrapper' ),
		);
	}

	/**
	 * @dataProvider handlebars_registration_hooks
	 */
	public function test_published_block_renders_a_helper_registered_by_a_theme( $hook ) {
		$register = static function ( $handlebars ) {
			$handlebars->registerHelper( 'test_caption', static function () {
				return 'Theme caption';
			} );
		};
		$handlebars = lazyblocks()->handlebars();
		$original   = $handlebars->object;
		add_action( $hook, $register );

		try {
			$handlebars->prepare();
			$this->add_test_block( array( 'code' => array( 'frontend_html' => '<p>{{test_caption}}</p>' ) ) );
			$this->assertSame(
				'<div class="wp-block-lazyblock-test"><p>Theme caption</p></div>',
				do_blocks( '<!-- wp:lazyblock/test /-->' )
			);
		} finally {
			remove_action( $hook, $register );
			$handlebars->object = $original;
		}
	}

	public static function handlebars_registration_hooks() {
		return array(
			array( 'lzb_handlebars_object' ),
			array( 'lzb/handlebars/object' ),
		);
	}

	/**
	 * @dataProvider php_template_hook_versions
	 */
	public function test_php_template_uses_editor_file_then_falls_back( $legacy ) {
		$frontend = wp_tempnam( 'lazy-blocks-deprecations-block.php' );
		$editor   = wp_tempnam( 'lazy-blocks-deprecations-editor.php' );
		file_put_contents( $frontend, '<p>Shared template</p>' );
		file_put_contents( $editor, '<p>Editor template</p>' );

		$resolve = static function ( $filename ) use ( $frontend, $editor ) {
			if ( 'editor.php' === basename( $filename ) ) {
				return $editor;
			}

			return $frontend;
		};
		$exists = static function ( $path, $filename ) use ( $resolve ) {
			return $resolve( $filename );
		};
		$prefix = $legacy ? 'lzb/' : 'lzb/block_render/';
		if ( $legacy ) {
			$this->setExpectedDeprecated( 'lzb/template_exists' );
			$this->setExpectedDeprecated( 'lzb/include_template' );
			$include = $exists;
		} else {
			$include = static function ( $path, $attributes, $block, $location ) use ( $resolve ) {
				$editor_path = $resolve( 'editor.php' );

				return 'editor' === $location && is_file( $editor_path ) ? $editor_path : $resolve( 'block.php' );
			};
		}

		add_filter( $prefix . 'template_exists', $exists, 10, 2 );
		add_filter( $prefix . 'include_template', $include, 10, 4 );

		try {
			$this->add_test_block( array( 'code' => array( 'output_method' => 'template' ) ) );
			$blocks = lazyblocks()->blocks();
			$block  = $blocks->get_block( 'lazyblock/test' );

			$this->assertSame(
				'<div class="wp-block-lazyblock-test"><p>Shared template</p></div>',
				do_blocks( '<!-- wp:lazyblock/test /-->' )
			);
			$this->assertSame(
				'<div useBlockProps><p>Editor template</p></div>',
				$blocks->render_callback( array(), array(), '', 'editor', $block )
			);

			wp_delete_file( $editor );
			$this->assertSame(
				'<div useBlockProps><p>Shared template</p></div>',
				$blocks->render_callback( array(), array(), '', 'editor', $block )
			);
		} finally {
			remove_filter( $prefix . 'template_exists', $exists, 10 );
			remove_filter( $prefix . 'include_template', $include, 10 );
			wp_delete_file( $editor );
			wp_delete_file( $frontend );
		}
	}

	public static function php_template_hook_versions() {
		return array(
			'legacy hooks'  => array( true ),
			'current hooks' => array( false ),
		);
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
	}

	public function test_empty_block_render() {
		$this->add_test_block( array(
			'code' => array(
				'frontend_html' => '',
			),
		) );

		// Should not render anything.
		$this->assertEquals(
			'',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);
	}

	public function test_broken_handlebars_template_keeps_surrounding_content_visible() {
		wp_set_current_user( 0 );
		$this->add_test_block( array(
			'controls' => array(
				'condition' => array(
					'name' => 'a',
					'type' => 'toggle',
				),
			),
			'code' => array(
				'frontend_html' => '{{#if a}}A{{else if b}}B{{else}}C{{/if}}',
			),
		) );

		$this->assertSame(
			'<p>Before</p><p>After</p>',
			do_blocks( '<p>Before</p><!-- wp:lazyblock/test {"a":true} /--><p>After</p>' )
		);
	}

	public function test_broken_handlebars_template_shows_error_to_lazy_block_editors() {
		$editor = self::factory()->user->create_and_get( array( 'role' => 'editor' ) );
		$editor->add_cap( 'edit_lazyblocks' );
		wp_set_current_user( $editor->ID );

		$this->add_test_block( array(
			'controls' => array(
				'condition' => array(
					'name' => 'a',
					'type' => 'toggle',
				),
			),
			'code' => array(
				'frontend_html' => '{{#if a}}A{{else if b}}B{{else}}C{{/if}}',
			),
		) );

		$this->assertSame(
			'Variable name is invalid: &quot;else if b&quot;',
			do_blocks( '<!-- wp:lazyblock/test {"a":true} /-->' )
		);
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
	}

	public function test_block_render_inner_blocks_keeps_replacement_references() {
		$this->add_test_block( array(
			'controls' => array(
				'control-1' => array(
					'type' => 'inner_blocks',
					'name' => 'inner-content',
					'placement' => 'content',
				),
			),
			'code' => array(
				'frontend_html' => '<InnerBlocks />',
			),
		) );

		// Backslash references, dollar references and a double backslash, as an author typed them.
		$inner = '<p>a\1 b$1 c\\\\ d${1}</p>';

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test"><div class="lazyblock-inner-blocks">' . $inner . '</div></div>',
			$this->normalize_block_html(
				do_blocks( '<!-- wp:lazyblock/test --><!-- wp:paragraph -->' . $inner . '<!-- /wp:paragraph --><!-- /wp:lazyblock/test -->' )
			)
		);
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
				'frontend_html' => '<p>Hello:</p><InnerBlocks /><p>there.</p>',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Hello:</p>' .
				'<div class="lazyblock-inner-blocks">' .
					'<p>Inner Blocks</p>' .
					'<p>Number with $ character should not be replaced here -> $10</p>' .
				'</div>' .
				'<p>there.</p>' .
			'</div>',
			$this->normalize_block_html(
				do_blocks(
					'<!-- wp:lazyblock/test -->' .
						'<!-- wp:paragraph --><p>Inner Blocks</p><!-- /wp:paragraph -->' .
						'<!-- wp:paragraph --><p>Number with $ character should not be replaced here -> $10</p><!-- /wp:paragraph -->' .
					'<!-- /wp:lazyblock/test -->'
				)
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
				'frontend_html' => '<p>Hello:</p><InnerBlocks className="custom-class" /><p>there.</p>',
			),
		) );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Hello:</p>' .
				'<div class="custom-class"><p>Inner</p></div>' .
				'<p>there.</p>' .
			'</div>',
			$this->normalize_block_html(
				do_blocks(
					'<!-- wp:lazyblock/test -->' .
						'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
					'<!-- /wp:lazyblock/test -->'
				)
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
				'frontend_html' => '<p>Hello:</p><InnerBlocks className="custom-class" /><p>there.</p>',
			),
		) );

		add_filter( 'lzb/block_render/allow_inner_blocks_wrapper', '__return_false' );

		$this->assertEquals(
			'<div class="wp-block-lazyblock-test">' .
				'<p>Hello:</p>' .
				'<p>Inner</p>' .
				'<p>there.</p>' .
			'</div>',
			$this->normalize_block_html(
				do_blocks(
					'<!-- wp:lazyblock/test -->' .
						'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
					'<!-- /wp:lazyblock/test -->'
				)
			)
		);

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

		$filter = static function ( $attributes ) {
			$attributes['inner-content'] .= '<p>Filtered child content</p>';
			return $attributes;
		};
		add_filter( 'lzb/block_render/attributes', $filter, 20 );

		try {
			$this->assertEquals(
				'<div class="wp-block-lazyblock-test">' .
					'<p>Test</p>' .
					'<p>Inner</p><p>Filtered child content</p>' .
				'</div>',
				$this->normalize_block_html(
					do_blocks(
						'<!-- wp:lazyblock/test -->' .
							'<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' .
						'<!-- /wp:lazyblock/test -->'
					)
				)
			);
		} finally {
			remove_filter( 'lzb/block_render/attributes', $filter, 20 );
		}
	}
}
