<?php
class Block_Registration_Test extends WP_UnitTestCase {
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
}
