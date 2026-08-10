<?php
/**
 * File Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_File class.
 */
class LazyBlocks_Control_File extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name         = 'file';
		$this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1979 7.75L11.2111 5.77639C11.1264 5.607 10.9533 5.5 10.7639 5.5H5C4.72386 5.5 4.5 5.72386 4.5 6V17.75C4.5 18.0261 4.72386 18.25 5 18.25H19C19.2761 18.25 19.5 18.0261 19.5 17.75V8.25C19.5 7.97386 19.2761 7.75 19 7.75H12.1979ZM13.125 6.25L12.5528 5.10557C12.214 4.428 11.5215 4 10.7639 4H5C3.89543 4 3 4.89543 3 6V17.75C3 18.8546 3.89543 19.75 5 19.75H19C20.1046 19.75 21 18.8546 21 17.75V8.25C21 7.14543 20.1046 6.25 19 6.25H13.125Z" fill="currentColor"/></svg>';
		$this->type         = 'string';
		$this->label        = __( 'File', 'lazy-blocks' );
		$this->category     = 'content';
		$this->restrictions = array(
			'default_settings' => false,
		);
		$this->attributes   = array(
			'allowed_mime_types' => array(),
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-file', 'build/control-file' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-file' );
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

		// The editor serializes the value with `encodeURI( JSON.stringify( value ) )`, but the
		// value may also be authored in the block markup as a raw JSON object. Both forms are
		// handled by `filter_control_value()`, so both have to pass the schema validation in
		// `WP_Block_Type::prepare_attributes_for_render()` — otherwise the object is dropped and
		// replaced with the default, and the block renders empty on the front end. The `object`
		// type is what matches the associative array the block parser decodes the object into.
		//
		// Skipped for meta controls: their value comes from post meta, not from the block
		// markup, and `register_meta()` accepts a single scalar type, not a union.
		if ( ! isset( $attribute_data['source'] ) || 'meta' !== $attribute_data['source'] ) {
			$attribute_data['type'] = array( 'string', 'object' );
		}

		return $attribute_data;
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
		if ( ! is_string( $value ) ) {
			return $value;
		}

		return json_decode( rawurldecode( $value ), true );
	}
}

new LazyBlocks_Control_File();
