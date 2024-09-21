<?php
/**
 * LazyBlocks assets.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class to work with assets.
 */
class LazyBlocks_Assets {
	/**
	 * Init hooks.
	 */
	public static function init_hooks() {
		add_action( 'enqueue_block_editor_assets', 'LazyBlocks_Assets::enqueue_runtime' );
	}

	/**
	 * Check if Webpack HMR file available.
	 *
	 * @return boolean
	 */
	public static function is_webpack_hmr_support() {
		return file_exists( lazyblocks()->plugin_path() . 'build/runtime.js' );
	}

	/**
	 * Enqueue runtime script.
	 */
	public static function enqueue_runtime() {
		// HMR Webpack.
		if ( self::is_webpack_hmr_support() ) {
			self::enqueue_script( 'lazy-blocks-runtime', 'build/runtime', false );
		}
	}

	/**
	 * Get .asset.php file data.
	 *
	 * @param string $filepath asset file path.
	 *
	 * @return array
	 */
	public static function get_asset_file( $filepath ) {
		$asset_path = lazyblocks()->plugin_path() . $filepath . '.asset.php';

		if ( file_exists( $asset_path ) ) {
			// phpcs:ignore WPThemeReview.CoreFunctionality.FileInclude.FileIncludeFound
			return include $asset_path;
		}

		return array(
			'dependencies' => array(),
			'version'      => LAZY_BLOCKS_VERSION,
		);
	}

	/**
	 * Register script.
	 *
	 * @param string  $name asset name.
	 * @param string  $path file path.
	 * @param boolean $in_footer render in footer.
	 */
	public static function register_script( $name, $path, $in_footer = true ) {
		$script_data = self::get_asset_file( $path );

		wp_register_script(
			$name,
			lazyblocks()->plugin_url() . $path . '.js',
			$script_data['dependencies'],
			$script_data['version'],
			$in_footer
		);
	}

	/**
	 * Enqueue script.
	 *
	 * @param string  $name asset name.
	 * @param string  $path file path.
	 * @param boolean $in_footer render in footer.
	 */
	public static function enqueue_script( $name, $path = '', $in_footer = true ) {
		if ( $path ) {
			self::register_script( $name, $path, $in_footer );
		}

		wp_enqueue_script( $name );
	}

	/**
	 * Register style
	 *
	 * @param string $name asset name.
	 * @param string $path file path.
	 */
	public static function register_style( $name, $path ) {
		$style_data = self::get_asset_file( $path );

		wp_register_style(
			$name,
			lazyblocks()->plugin_url() . $path . '.css',
			array(),
			$style_data['version']
		);
	}

	/**
	 * Enqueue style
	 *
	 * @param string $name asset name.
	 * @param string $path file path.
	 */
	public static function enqueue_style( $name, $path = '' ) {
		if ( $path ) {
			self::register_style( $name, $path );
		}

		wp_enqueue_style( $name );
	}
}

LazyBlocks_Assets::init_hooks();
