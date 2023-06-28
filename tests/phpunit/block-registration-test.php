<?php
class Block_Registration_Test extends WP_UnitTestCase {
	public function set_up() {
		parent::set_up();

		lazyblocks()->add_block( array(
			'title' => 'Test Custom Block',
			'slug' => 'lazyblock/test-custom-block',
		) );
	}

	public function tear_down() {
		lazyblocks()->blocks()->remove_block( 'lazyblock/test-custom-block' );

		parent::tear_down();
	}

	// Test if the latest registered block is test block.
	public function test_block_registered() {
		$block = lazyblocks()->blocks()->get_block( 'lazyblock/test-custom-block' );

		$this->assertEquals(
			'lazyblock/test-custom-block',
			$block['slug']
		);
	}

	public function test_block_removed() {
		lazyblocks()->add_block( array(
			'title' => 'Test Removable Custom Block',
			'slug' => 'lazyblock/test-removable-custom-block',
		) );

		$block = lazyblocks()->blocks()->get_block( 'lazyblock/test-removable-custom-block' );
		$this->assertEquals(
			'lazyblock/test-removable-custom-block',
			$block['slug']
		);

		lazyblocks()->blocks()->remove_block( 'lazyblock/test-removable-custom-block' );

		$block = lazyblocks()->blocks()->get_block( 'lazyblock/test-removable-custom-block' );
		$this->assertEquals(
			null,
			$block
		);
	}

	// All block defaults should be added even when
	// it is not specified in the registration block array.
	// But we will test just a few parameters, not all.
	public function test_block_defaults() {
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
	}

	// If the block with the selected slug is already registered,
	// next registration attempts should not work.
	public function test_no_duplicated_blocks() {
		lazyblocks()->add_block( array(
			'title' => 'Test Custom Block 2',
			'slug' => 'lazyblock/test-custom-block',
		) );
		lazyblocks()->add_block( array(
			'title' => 'Test Custom Block 3',
			'slug' => 'lazyblock/test-custom-block',
		) );

		$blocks = lazyblocks()->blocks()->get_blocks();
		$this->assertEquals(
			1,
			count( $blocks )
		);

		$block = lazyblocks()->blocks()->get_block( 'lazyblock/test-custom-block' );
		$this->assertEquals(
			'Test Custom Block',
			$block['title']
		);
	}
}
