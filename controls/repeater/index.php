<?php
/**
 * Repeater Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_Repeater class.
 */
class LazyBlocks_Control_Repeater extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name         = 'repeater';
		$this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.2 3.75H17.8C18.6009 3.75 19.25 4.30964 19.25 5V9C19.25 9.69036 18.6009 10.25 17.8 10.25H6.2C5.39918 10.25 4.75 9.69036 4.75 9V5C4.75 4.30964 5.39918 3.75 6.2 3.75Z" stroke="currentColor" stroke-width="1.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 7.75H7V6.25H8.5V7.75Z" fill="currentColor"/><path d="M6.2 13.75H17.8C18.6009 13.75 19.25 14.3096 19.25 15V19C19.25 19.6904 18.6009 20.25 17.8 20.25H6.2C5.39918 20.25 4.75 19.6904 4.75 19V15C4.75 14.3096 5.39918 13.75 6.2 13.75Z" stroke="currentColor" stroke-width="1.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 17.75H7V16.25H8.5V17.75Z" fill="currentColor"/></svg>';
		$this->type         = 'string';
		$this->label        = __( 'Repeater', 'lazy-blocks' );
		$this->category     = 'layout';
		$this->restrictions = array(
			'as_child'          => false,
			'default_settings'  => false,
			'required_settings' => false,
		);
		$this->attributes   = array(
			'rows_min'              => '',
			'rows_max'              => '',
			'rows_label'            => '',
			'rows_add_button_label' => '',
			'rows_collapsible'      => 'true',
			'rows_collapsed'        => 'true',
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 5 );

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-repeater', 'build/control-repeater' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-repeater' );
	}

	/**
	 * Filter block attribute.
	 *
	 * @param array $attribute_data - attribute data.
	 * @param array $control - control data.
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

		$attribute_data['default'] = rawurlencode( wp_json_encode( array() ) );

		return $attribute_data;
	}

	/**
	 * Find control ID by name.
	 *
	 * @param string $name - control name.
	 * @param array  $block_data - block data.
	 *
	 * @return mixed
	 */
	public function get_control_id_by_name( $name, $block_data ) {
		$control_id = null;

		// Find control ID.
		foreach ( $block_data['controls'] as $id => $control ) {
			if ( $name === $control['name'] ) {
				$control_id = $id;
				break;
			}
		}

		return $control_id;
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
		if ( ! is_string( $value ) && ! is_array( $value ) ) {
			return $value;
		}

		// Maybe decode.
		if ( is_string( $value ) ) {
			$value = json_decode( rawurldecode( $value ), true );
		}

		if ( ! empty( $block_data['controls'] ) && ! empty( $value ) ) {
			// Find repeater control ID.
			$repeater_control_id = $this->get_control_id_by_name( $control_data['name'], $block_data );

			if ( $repeater_control_id ) {
				// Find all repeater inner controls data.
				foreach ( $block_data['controls'] as $inner_control_data ) {
					if ( isset( $inner_control_data['child_of'] ) && $inner_control_data['child_of'] === $repeater_control_id ) {
						// Filter repeater each control output.
						foreach ( $value as $k => $row_data ) {
							foreach ( $row_data as $i => $inner_control ) {
								if ( $i === $inner_control_data['name'] ) {
									// apply filters for control values.
									$value[ $k ][ $i ] = lazyblocks()->controls()->filter_control_value( $value[ $k ][ $i ], $inner_control_data, $block_data, $context );
								}
							}
						}
					}
				}
			}
		}

		return $value;
	}
}

new LazyBlocks_Control_Repeater();
