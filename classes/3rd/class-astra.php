<?php
/**
 * Astra theme.
 *
 * @package @@plugin_name
 */

/**
 * LazyBlocks_3rd_Astra
 */
class LazyBlocks_3rd_Astra {
	/**
	 * LazyBlocks_3rd_Astra constructor.
	 */
	public function __construct() {
		if ( 'astra' !== get_template() ) {
			return;
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'block_builder_enqueue_scripts' ) );
	}

	/**
	 * Enqueue additional styles for Astra theme.
	 */
	public function block_builder_enqueue_scripts() {
		if ( 'lazyblocks' === get_post_type() ) {
			LazyBlocks_Assets::enqueue_style( 'lazyblocks-block-builder-3rd-astra', 'build/editor-block-builder-astra-style' );
			wp_style_add_data( 'lazyblocks-block-builder-3rd-astra', 'rtl', 'replace' );

			/**
			 * When we add support for editor-styles, there are a lot of styles looks broken in Block Builder.
			 * Here we are trying to fix it.
			 *
			 * @link https://wordpress.org/support/topic/possible-display-bug-in-admin-when-adding-theme-support-for-editor-styles/
			 */
			remove_theme_support( 'editor-styles' );
		}
	}
}

new LazyBlocks_3rd_Astra();
