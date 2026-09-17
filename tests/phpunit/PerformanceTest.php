<?php
/**
 * Counts the work a frontend render does, so a change that scales with the number of rendered
 * blocks or block definitions fails here instead of on a site.
 */
class PerformanceTest extends WP_UnitTestCase {
	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();

		if ( $registry->is_registered( 'lazyblock/perf' ) ) {
			$registry->unregister( 'lazyblock/perf' );
		}

		lazyblocks()->blocks()->remove_block( 'lazyblock/perf' );

		parent::tear_down();
	}

	// get_blocks() re-runs the lzb/get_blocks sanitizer over every block and control string,
	// so a page must not fetch the blocks list once per rendered block.
	public function test_render_fetches_blocks_at_most_once() {
		lazyblocks()->add_block( array(
			'slug'     => 'lazyblock/perf',
			'controls' => array(
				'control-1' => array(
					'type'      => 'text',
					'name'      => 'text',
					'placement' => 'inspector',
				),
			),
			'code'     => array(
				'output_method' => 'html',
				'frontend_html' => '<p>{{text}}</p>',
				'single_output' => true,
			),
		) );
		lazyblocks()->blocks()->register_block_render();

		$count   = 0;
		$counter = function( $blocks ) use ( &$count ) {
			$count++;

			return $blocks;
		};

		add_filter( 'lzb/get_blocks', $counter );
		$html = do_blocks( str_repeat(
			'<!-- wp:lazyblock/perf {"text":"lazy"} /--><!-- wp:paragraph --><p>core</p><!-- /wp:paragraph -->',
			10
		) );
		remove_filter( 'lzb/get_blocks', $counter );

		$this->assertSame( 10, substr_count( $html, '<p>lazy</p>' ) );
		$this->assertLessThanOrEqual( 1, $count, 'get_blocks() ran once per rendered block' );
	}
}
