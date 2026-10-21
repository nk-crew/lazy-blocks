<?php
/**
 * Editor assets: what the plugin prints into editor and admin screens.
 */
class EditorAssetsTest extends WP_UnitTestCase {
	private $original_scripts;

	public function set_up() {
		parent::set_up();

		$this->original_scripts = isset( $GLOBALS['wp_scripts'] ) ? $GLOBALS['wp_scripts'] : null;
		$GLOBALS['wp_scripts']  = new WP_Scripts();
	}

	public function tear_down() {
		$GLOBALS['wp_scripts'] = $this->original_scripts;

		lazyblocks()->blocks()->remove_block( 'lazyblock/editor-assets' );

		parent::tear_down();
	}

	// The ~300 KB icons list is localized only on the block builder screen,
	// not into the editor data built on every request.
	public function test_editor_data_does_not_contain_icons() {
		lazyblocks()->blocks()->register_block();

		$data = wp_scripts()->get_data( 'lazyblocks-editor', 'data' );

		$this->assertStringContainsString( 'var lazyblocksGutenberg', $data );
		$this->assertStringContainsString( '"controls"', $data );
		$this->assertStringNotContainsString( '"icons"', $data );
		$this->assertStringNotContainsString( 'accessibility', $data );
	}

	// The unused date_i18n vendor script is no longer loaded on admin screens.
	public function test_admin_screens_do_not_load_date_i18n() {
		( new LazyBlocks_Admin() )->admin_enqueue_scripts();

		$this->assertFalse( wp_script_is( 'date_i18n', 'registered' ) );
		$this->assertTrue( wp_style_is( 'lazyblocks-admin', 'enqueued' ) );
	}

	// Control scripts wait for the shared webpack chunk, so it must load with them.
	public function test_control_scripts_depend_on_the_shared_vendor_chunk() {
		lazyblocks()->add_block( array( 'slug' => 'lazyblock/editor-assets' ) );

		do_action( 'enqueue_block_editor_assets' );

		$this->assertTrue( wp_script_is( 'lazyblocks-control-select', 'enqueued' ) );
		$this->assertContains( 'lazyblocks-controls-vendor', wp_scripts()->query( 'lazyblocks-control-select' )->deps );
		$this->assertContains( 'lazyblocks-controls-vendor', wp_scripts()->query( 'lazyblocks-control-repeater' )->deps );
		$this->assertStringEndsWith( 'build/controls-vendor.js', wp_scripts()->query( 'lazyblocks-controls-vendor' )->src );
	}
}
