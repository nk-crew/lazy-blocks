<?php
class BlockRegistrationTest extends WP_UnitTestCase {
	// Test if the latest registered block is test block.
	public function test_block_registered() {
		$block_slug = 'lazyblock/test';

		lazyblocks()->add_block( array(
			'slug' => $block_slug,
		) );

		$block = lazyblocks()->blocks()->get_block( $block_slug );

		$this->assertEquals(
			$block_slug,
			$block['slug']
		);

		lazyblocks()->blocks()->remove_block( $block_slug );

		// Check if block is removed.
		$block = lazyblocks()->blocks()->get_block( $block_slug );

		$this->assertEquals(
			null,
			$block
		);
	}

	// All block defaults should be added even when
	// it is not specified in the registration block array.
	// But we will test just a few parameters, not all.
	public function test_block_defaults() {
		$block_slug = 'lazyblock/test';

		lazyblocks()->add_block( array(
			'slug' => $block_slug,
		) );

		$defaults = lazyblocks()->blocks()->get_block_defaults();
		$blocks = lazyblocks()->blocks()->get_blocks();

		$this->assertEquals(
			$defaults['lazyblocks_description'],
			$blocks[0]['description']
		);
		$this->assertEquals(
			$defaults['lazyblocks_styles'],
			$blocks[0]['styles']
		);
		$this->assertEquals(
			$defaults['lazyblocks_supports_multiple'],
			$blocks[0]['supports']['multiple']
		);

		lazyblocks()->blocks()->remove_block( $block_slug );
	}

	// If the block with the selected slug is already registered,
	// next registration attempts should not work.
	public function test_no_duplicated_blocks() {
		$block_slug = 'lazyblock/test';

		lazyblocks()->add_block( array(
			'title' => 'Block Registration Duplicates Test 1',
			'slug' => $block_slug,
		) );
		lazyblocks()->add_block( array(
			'title' => 'Block Registration Duplicates Test 2',
			'slug' => $block_slug,
		) );

		$blocks = lazyblocks()->blocks()->get_blocks();
		$this->assertEquals(
			1,
			count( $blocks )
		);

		$block = lazyblocks()->blocks()->get_block( $block_slug );
		$this->assertEquals(
			'Block Registration Duplicates Test 1',
			$block['title']
		);

		lazyblocks()->blocks()->remove_block( $block_slug );
	}

	public function test_get_blocks_does_not_prepare_user_blocks_more_than_once_per_request() {
		$block_slug = 'lazyblock/request-cache-test';
		$prepare_count = 0;

		$count_prepare = function( $block_data ) use ( &$prepare_count ) {
			if ( isset( $block_data['slug'] ) && 'lazyblock/' === $block_data['slug'] ) {
				$prepare_count++;
			}

			return $block_data;
		};

		add_filter( 'lzb/block_data', $count_prepare );

		lazyblocks()->add_block( array(
			'slug' => $block_slug,
		) );

		lazyblocks()->blocks()->get_blocks();
		lazyblocks()->blocks()->get_blocks();

		remove_filter( 'lzb/block_data', $count_prepare );
		lazyblocks()->blocks()->remove_block( $block_slug );

		$this->assertEquals(
			1,
			$prepare_count
		);
	}

	public function test_get_blocks_request_cache_is_cleared_when_user_blocks_change() {
		$first_block_slug  = 'lazyblock/request-cache-first';
		$second_block_slug = 'lazyblock/request-cache-second';

		lazyblocks()->add_block( array(
			'slug' => $first_block_slug,
		) );

		lazyblocks()->blocks()->get_blocks();

		$this->assertNotNull( lazyblocks()->blocks()->get_block( $first_block_slug ) );

		lazyblocks()->add_block( array(
			'slug' => $second_block_slug,
		) );

		$this->assertNotNull( lazyblocks()->blocks()->get_block( $second_block_slug ) );

		lazyblocks()->blocks()->remove_block( $first_block_slug );

		$this->assertNull( lazyblocks()->blocks()->get_block( $first_block_slug ) );

		lazyblocks()->blocks()->remove_block( $second_block_slug );
	}

	public function test_get_blocks_filter_runs_on_repeated_calls() {
		$block_slug = 'lazyblock/request-cache-filter';
		$filter_count = 0;

		$count_filter = function( $blocks ) use ( &$filter_count ) {
			$filter_count++;

			return $blocks;
		};

		add_filter( 'lzb/get_blocks', $count_filter );

		lazyblocks()->add_block( array(
			'slug' => $block_slug,
		) );

		lazyblocks()->blocks()->get_blocks();
		lazyblocks()->blocks()->get_blocks();

		remove_filter( 'lzb/get_blocks', $count_filter );
		lazyblocks()->blocks()->remove_block( $block_slug );

		$this->assertEquals(
			2,
			$filter_count
		);
	}
}
