<?php
/**
 * Block context in the render callback.
 *
 * The first tests pin the output of Handlebars, PHP, InnerBlocks and REST renders
 * as shipped in 4.4.2, so passing the WP_Block context changes nothing for blocks
 * that do not use context.
 */
class BlockContextRenderTest extends WP_UnitTestCase {
	const SLUG = 'lazyblock/test';

	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( self::SLUG ) ) {
			$registry->unregister( self::SLUG );
		}

		lazyblocks()->blocks()->remove_block( self::SLUG );

		parent::tear_down();
	}

	private function add_test_block( $code, $controls = array() ) {
		lazyblocks()->add_block(
			array(
				'slug'     => self::SLUG,
				'controls' => array_merge(
					array(
						'control-1' => array(
							'type' => 'text',
							'name' => 'text-control',
						),
					),
					$controls
				),
				'code'     => $code,
			)
		);

		lazyblocks()->blocks()->register_block_render();
	}

	private function use_post_context() {
		add_filter(
			'lzb/register_block_type_data',
			function ( $data ) {
				$data['uses_context'] = array( 'postId', 'postType' );
				return $data;
			}
		);
	}

	private function php_code() {
		return array(
			'output_method' => 'php',
			'frontend_html' => '<p><?php echo esc_html( $attributes[\'text-control\'] ); ?>|<?php echo null === $context ? \'null\' : esc_html( wp_json_encode( $context ) ); ?></p>',
		);
	}

	public function test_handlebars_render_is_unchanged() {
		$this->add_test_block(
			array(
				'frontend_html' => '<p>{{text-control}}|{{postId}}</p>',
			)
		);

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>val|</p></div>',
			do_blocks( '<!-- wp:lazyblock/test {"text-control":"val"} /-->' )
		);
	}

	public function test_php_render_without_uses_context_gets_null_context() {
		$this->add_test_block( $this->php_code() );

		$post_id = self::factory()->post->create();
		$this->go_to( get_permalink( $post_id ) );
		$this->assertTrue( have_posts() );
		the_post();

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>val|null</p></div>',
			do_blocks( '<!-- wp:lazyblock/test {"text-control":"val"} /-->' )
		);
	}

	public function test_inner_blocks_render_is_unchanged() {
		$this->add_test_block(
			array(
				'frontend_html' => '<p>{{text-control}}</p><InnerBlocks />',
			),
			array(
				'control-2' => array(
					'type'      => 'inner_blocks',
					'name'      => 'inner-content',
					'placement' => 'content',
				),
			)
		);

		$output = do_blocks(
			'<!-- wp:lazyblock/test {"text-control":"val"} -->' .
				'<!-- wp:paragraph --><p>In</p><!-- /wp:paragraph -->' .
			'<!-- /wp:lazyblock/test -->'
		);

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>val</p><div class="lazyblock-inner-blocks"><p>In</p></div></div>',
			str_replace( ' class="wp-block-paragraph"', '', $output )
		);
	}

	public function test_rest_render_passes_request_context() {
		$this->add_test_block(
			array(
				'editor_html'   => '<p>{{text-control}}|{{postId}}</p>',
				'frontend_html' => '<p>{{text-control}}|{{postId}}</p>',
			)
		);

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		$request = new WP_REST_Request( 'POST', '/lazy-blocks/v1/block-render' );
		$request->set_body_params(
			array(
				'name'            => self::SLUG,
				'render_location' => 'editor',
				'attributes'      => array(
					'lazyblock'    => array( 'slug' => self::SLUG ),
					'text-control' => 'val',
				),
				'context'         => array( 'postId' => 42 ),
			)
		);

		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame(
			array(
				'success'  => true,
				'response' => '<div useBlockProps><p>val|42</p></div>',
			),
			$response->get_data()
		);
	}

	public function test_handlebars_block_sees_post_context() {
		$this->use_post_context();
		$this->add_test_block(
			array(
				'frontend_html' => '<p>{{postId}}|{{postType}}</p>',
			)
		);

		$post_id = self::factory()->post->create();
		$this->go_to( get_permalink( $post_id ) );
		the_post();

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>' . $post_id . '|post</p></div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);
	}

	public function test_php_block_sees_post_context() {
		$this->use_post_context();
		$this->add_test_block( $this->php_code() );

		$post_id = self::factory()->post->create();
		$this->go_to( get_permalink( $post_id ) );
		the_post();

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>val|{&quot;postId&quot;:' . $post_id . ',&quot;postType&quot;:&quot;post&quot;}</p></div>',
			do_blocks( '<!-- wp:lazyblock/test {"text-control":"val"} /-->' )
		);
	}

	public function test_pro_style_render_override_keeps_working() {
		// Same closure shape as lazy-blocks-pro classes/class-relationships.php.
		add_filter(
			'lzb/register_block_type_data',
			function ( $data, $block ) {
				$data['uses_context']    = array( 'postId' );
				$data['render_callback'] = function ( $render_attributes, $render_content = null, $block_instance = null ) use ( $block ) {
					$context = null;

					if ( $block_instance && isset( $block_instance->context ) ) {
						$context = $block_instance->context;
					}

					return lazyblocks()->blocks()->render_callback( $render_attributes, $context, $render_content, 'frontend', $block );
				};
				return $data;
			},
			10,
			2
		);
		$this->add_test_block(
			array(
				'frontend_html' => '<p>{{postId}}</p>',
			)
		);

		$post_id = self::factory()->post->create();
		$this->go_to( get_permalink( $post_id ) );
		the_post();

		$this->assertSame(
			'<div class="wp-block-lazyblock-test"><p>' . $post_id . '</p></div>',
			do_blocks( '<!-- wp:lazyblock/test /-->' )
		);
	}

	/**
	 * Render the test block inside a Query Loop, whose post template adds postId and
	 * postType to the context of every inner block.
	 */
	private function render_in_query_loop( $block_attrs = '' ) {
		$post_id = self::factory()->post->create();

		$output = do_blocks(
			'<!-- wp:query {"queryId":1,"query":{"perPage":1,"postType":"post","inherit":false}} --><div class="wp-block-query">' .
				'<!-- wp:post-template -->' .
					'<!-- wp:lazyblock/test ' . $block_attrs . ' /-->' .
				'<!-- /wp:post-template -->' .
			'</div><!-- /wp:query -->'
		);

		return array( $post_id, $output );
	}

	private function add_post_id_control_block( $code ) {
		$this->add_test_block(
			$code,
			array(
				'control-2' => array(
					'type' => 'text',
					'name' => 'postId',
				),
			)
		);
	}

	public function test_query_loop_context_is_not_passed_without_uses_context() {
		$this->add_post_id_control_block(
			array(
				'frontend_html' => '<p>{{postId}}|{{postType}}</p>',
			)
		);

		list( , $output ) = $this->render_in_query_loop( '{"postId":"ctl"}' );

		$this->assertStringContainsString( '<div class="wp-block-lazyblock-test"><p>ctl|</p></div>', $output );
	}

	public function test_query_loop_context_is_null_in_php_without_uses_context() {
		$this->add_test_block( $this->php_code() );

		list( , $output ) = $this->render_in_query_loop( '{"text-control":"val"}' );

		$this->assertStringContainsString( '<div class="wp-block-lazyblock-test"><p>val|null</p></div>', $output );
	}

	public function test_query_loop_context_is_limited_to_uses_context() {
		add_filter(
			'lzb/register_block_type_data',
			function ( $data ) {
				$data['uses_context'] = array( 'postId' );
				return $data;
			}
		);
		$this->add_test_block( $this->php_code() );

		list( $post_id, $output ) = $this->render_in_query_loop( '{"text-control":"val"}' );

		$this->assertStringContainsString( '<div class="wp-block-lazyblock-test"><p>val|{&quot;postId&quot;:' . $post_id . '}</p></div>', $output );
	}
}
