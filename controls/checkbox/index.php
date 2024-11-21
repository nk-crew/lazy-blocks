<?php
/**
 * Checkbox Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_Checkbox class.
 */
class LazyBlocks_Control_Checkbox extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name         = 'checkbox';
		$this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M15.94 8.59219L10.6727 15.6762L7.61835 13.4051" stroke="currentColor" stroke-width="1.5"/></svg>';
		$this->type         = 'boolean';
		$this->label        = __( 'Checkbox', 'lazy-blocks' );
		$this->category     = 'choice';
		$this->restrictions = array(
			'default_settings' => false,
		);
		$this->attributes   = array(
			'checked'        => 'false',
			'alongside_text' => '',
			'choices'        => array(),
			'multiple'       => 'false',
			'output_format'  => '',
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-checkbox', 'build/control-checkbox' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-checkbox' );
	}

	/**
	 * Filter block attribute.
	 *
	 * @param array $attribute_data - attribute data.
	 * @param mixed $control - control data.
	 *
	 * @return array filtered attribute data.
	 */
	public function filter_lzb_prepare_block_attribute( $attribute_data, $control ) {
		if (
			! $control ||
			! isset( $control['type'] ) ||
			$this->name !== $control['type']
		) {
			return $attribute_data;
		}

		// Set multiple value.
		if ( isset( $control['multiple'] ) && 'true' === $control['multiple'] ) {
			$attribute_data['type']    = 'array';
			$attribute_data['items']   = array( 'type' => 'string' );
			$attribute_data['default'] = $attribute_data['default'] ? explode( ',', $attribute_data['default'] ) : array();

			// Set default checked value for single checkbox.
		} elseif ( isset( $control['checked'] ) && ( ! isset( $attribute_data['default'] ) || ! is_bool( $attribute_data['default'] ) ) ) {
			$attribute_data['default'] = 'true' === $control['checked'];
		}

		return $attribute_data;
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
	 * Get new attribute value.
	 *
	 * @param string $value - attribute value.
	 * @param array  $control - control data.
	 *
	 * @return array
	 */
	public function get_new_attribute_value( $value, $control ) {
		if ( isset( $control['multiple'] ) && 'true' === $control['multiple'] && is_array( $value ) ) {
			foreach ( $value as $k => $item ) {
				$choice_data = $this->get_choice_data_by_value( $value[ $k ], $control );

				if ( 'label' === $control['output_format'] ) {
					$value[ $k ] = $choice_data['label'];
				} elseif ( 'array' === $control['output_format'] ) {
					$value[ $k ] = $choice_data;
				}
			}
		}

		return $value;
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
		if (
			! isset( $control_data['multiple'] ) ||
			'true' !== $control_data['multiple'] ||
			! isset( $control_data['output_format'] ) ||
			! $control_data['output_format']
		) {
			return $value;
		}

		return $this->get_new_attribute_value( $value, $control_data );
	}
}

new LazyBlocks_Control_Checkbox();
