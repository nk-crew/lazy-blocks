<?php
/**
 * Radio Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_Radio class.
 */
class LazyBlocks_Control_Radio extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name       = 'radio';
		$this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
		$this->type       = 'string';
		$this->label      = __( 'Radio', 'lazy-blocks' );
		$this->category   = 'choice';
		$this->attributes = array(
			'choices'       => array(),
			'allow_null'    => 'false',
			'output_format' => '',
		);

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-radio', 'build/control-radio' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-radio' );
	}

	/**
	 * Get choice data by control value.
	 *
	 * @param string $value - attribute value.
	 * @param array  $control - control data.
	 *
	 * @return array
	 */
	public function get_choice_data_by_value( $value, $control ) {
		$choice_data = array(
			'value' => $value,
			'label' => $value,
		);

		if ( isset( $control['choices'] ) && is_array( $control['choices'] ) ) {
			foreach ( $control['choices'] as $choice ) {
				if ( $value === $choice['value'] ) {
					$choice_data = $choice;
				}
			}
		}

		return $choice_data;
	}

	/**
	 * Change control output to array.
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
		if ( isset( $control_data['output_format'] ) && $control_data['output_format'] ) {
			$choice_data = $this->get_choice_data_by_value( $value, $control_data );

			if ( 'label' === $control_data['output_format'] ) {
				$value = $choice_data['label'];
			} elseif ( 'array' === $control_data['output_format'] ) {
				$value = $choice_data;
			}
		}

		return $value;
	}
}

new LazyBlocks_Control_Radio();
