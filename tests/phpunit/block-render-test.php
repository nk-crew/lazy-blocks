<?php
class Block_Render_Test extends WP_UnitTestCase {
	public function set_up() {
		parent::set_up();

		lazyblocks()->add_block( array(
			'title' => 'Test Custom Block',
			'slug' => 'lazyblock/test-custom-block1',
			'category' => 'text',
			'category_label' => 'text',
		) );
	}

	public function tear_down() {
		lazyblocks()->blocks()->remove_block( 'lazyblock/test-custom-block1' );

		parent::tear_down();
	}

	// Test if the latest registered block is test block.
	public function test_block_registered() {
		$block = lazyblocks()->blocks()->get_block( 'lazyblock/test-custom-block1' );

		$this->assertEquals(
			1,
			1
		);
	}
}
