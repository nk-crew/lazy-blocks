<?php
/**
 * LazyBlocks controls.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Controls class. Class to work with LazyBlocks Controls.
 */
class LazyBlocks_Controls {
	/**
	 * LazyBlocks_Controls constructor.
	 */
	public function __construct() {
		add_action( 'lzb/init', array( $this, 'include_controls' ), 5 );
	}

	/**
	 * Get all controls.
	 *
	 * @return array
	 */
	public function get_controls() {
		return apply_filters( 'lzb/controls/all', array() );
	}

	/**
	 * Get all controls categories.
	 *
	 * @return array
	 */
	public function get_controls_categories() {
		return apply_filters(
			'lzb/controls/categories',
			array(
				'basic'      => __( 'Basic', 'lazy-blocks' ),
				'content'    => __( 'Content', 'lazy-blocks' ),
				'choice'     => __( 'Choice', 'lazy-blocks' ),
				'advanced'   => __( 'Advanced', 'lazy-blocks' ),
				'layout'     => __( 'Layout', 'lazy-blocks' ),
				'deprecated' => __( 'Deprecated', 'lazy-blocks' ),
			)
		);
	}

	/**
	 * Filter control value.
	 * Used in block render callback, get meta function and inside repeater items render.
	 *
	 * @param mixed  $value - control value.
	 * @param array  $control_data - control data.
	 * @param array  $block_data - block data.
	 * @param string $context - block render context.
	 *
	 * @return mixed
	 */
	public function filter_control_value( $value, $control_data, $block_data, $context ) {
		// apply filters for control values in the same way as in class-blocks.php.
		if ( $control_data ) {
			$value = apply_filters( 'lzb/control_value', $value, $control_data, $block_data, $context );
			$value = apply_filters( 'lzb/control_value/control_type=' . $control_data['type'], $value, $control_data, $block_data, $context );
			$value = apply_filters( 'lzb/control_value/control_name=' . $control_data['name'], $value, $control_data, $block_data, $context );
			$value = apply_filters( 'lzb/control_value/block_slug=' . $block_data['slug'], $value, $control_data, $block_data, $context );
		}

		return $value;
	}

	/**
	 * Include controls.
	 */
	public function include_controls() {
		// Sort.
		$sort = array(
			'_base',

			// Basic.
			'text',
			'textarea',
			'number',
			'range',
			'url',
			'email',
			'password',

			// Content.
			'image',
			'gallery',
			'file',
			'rich_text',
			'classic_editor',
			'code_editor',
			'inner_blocks',

			// Choice.
			'select',
			'radio',
			'checkbox',
			'toggle',

			// Advanced.
			'color',
			'date_time',

			// Layout.
			'repeater',
		);

		$all_controls = glob( dirname( dirname( __FILE__ ) ) . '/controls/*/index.php' );

		// include sorted controls.
		foreach ( $sort as $file_name ) {
			foreach ( $all_controls as $k => $file_path ) {
				if ( $this->ends_with( $file_path, '/' . $file_name . '/index.php' ) ) {
					require_once $file_path;
					unset( $all_controls[ $k ] );
				}
			}
		}

		// include remaining controls.
		foreach ( $all_controls as $file ) {
			require_once $file;
		}
	}

	/**
	 * Ends With Function
	 *
	 * @param string $haystack - string to check.
	 * @param string $needle - needle string.
	 *
	 * @return boolean
	 */
	private function ends_with( $haystack, $needle ) {
		return substr_compare( $haystack, $needle, -strlen( $needle ) ) === 0;
	}
}
