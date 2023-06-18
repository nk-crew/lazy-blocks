<?php
/**
 * Color Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_Color class.
 */
class LazyBlocks_Control_Color extends LazyBlocks_Control {
	/**
	 * Saved color palette
	 *
	 * @var false|array
	 */
	public $color_palette = false;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name       = 'color';
		$this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4405 13.9048C17.4405 16.8569 15.0473 19.25 12.0952 19.25C9.14314 19.25 6.75 16.8569 6.75 13.9048C6.75 13.2532 7.05742 12.3484 7.61616 11.2861C8.16265 10.2472 8.89988 9.14863 9.65011 8.13668C10.3983 7.12748 11.1482 6.21939 11.7119 5.56279C11.8524 5.3991 11.9812 5.25128 12.0952 5.12167C12.2093 5.25128 12.338 5.3991 12.4786 5.56279C13.0423 6.21939 13.7922 7.12748 14.5404 8.13668C15.2906 9.14863 16.0278 10.2472 16.5743 11.2861C17.1331 12.3484 17.4405 13.2532 17.4405 13.9048Z" stroke="currentColor" stroke-width="1.5"/></svg>';
		$this->type       = 'string';
		$this->label      = __( 'Color Picker', 'lazy-blocks' );
		$this->category   = 'advanced';
		$this->attributes = array(
			'alpha'          => 'false',
			'palette'        => 'true',
			'alongside_text' => '',
			'output_format'  => '',
		);

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-color', 'build/control-color' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-color' );
	}

	/**
	 * Get slug by color value.
	 *
	 * @param string $color - color value.
	 *
	 * @return string
	 */
	public function get_slug_by_color( $color ) {
		if ( ! is_array( $this->color_palette ) ) {
			$this->color_palette = array();

			// Support for old themes palettes.
			$old_color_palette = get_theme_support( 'editor-color-palette' );
			if ( ! empty( $old_color_palette ) ) {
				$old_color_palette   = $old_color_palette[0];
				$this->color_palette = wp_list_pluck( $old_color_palette, 'slug', 'color' );
			}

			// Support for new FSE themes data.
			if ( method_exists( 'WP_Theme_JSON_Resolver', 'get_theme_data' ) ) {
				$theme_settings = WP_Theme_JSON_Resolver::get_theme_data()->get_settings();

				if ( isset( $theme_settings['color']['palette']['theme'] ) && ! empty( $theme_settings['color']['palette']['theme'] ) ) {
					$this->color_palette = array_merge(
						$this->color_palette,
						wp_list_pluck( $theme_settings['color']['palette']['theme'], 'slug', 'color' )
					);
				}
			}
		}

		if ( isset( $this->color_palette[ $color ] ) ) {
			return $this->color_palette[ $color ];
		}

		return '';
	}

	/**
	 * Change color control output to array if needed.
	 *
	 * @param mixed  $value - control value.
	 * @param array  $control_data - control data.
	 * @param array  $block_data - block data.
	 * @param string $context - block render context.
	 *
	 * @return string|array
	 */
	// phpcs:ignore
	public function filter_control_value( $value, $control_data, $block_data, $context ) {
		if ( 'array' !== $control_data['output_format'] ) {
			return $value;
		}

		return array(
			'color' => $value,
			'slug'  => $this->get_slug_by_color( $value ),
		);
	}
}

new LazyBlocks_Control_Color();
