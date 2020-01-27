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
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 15V19H5V15H19ZM20 13H4C3.45 13 3 13.45 3 14V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V14C21 13.45 20.55 13 20 13ZM7 18.5C6.18 18.5 5.5 17.83 5.5 17C5.5 16.17 6.18 15.5 7 15.5C7.82 15.5 8.5 16.17 8.5 17C8.5 17.83 7.83 18.5 7 18.5ZM19 5V9H5V5H19ZM20 3H4C3.45 3 3 3.45 3 4V10C3 10.55 3.45 11 4 11H20C20.55 11 21 10.55 21 10V4C21 3.45 20.55 3 20 3ZM7 8.5C6.18 8.5 5.5 7.83 5.5 7C5.5 6.17 6.18 5.5 7 5.5C7.82 5.5 8.5 6.18 8.5 7C8.5 7.82 7.83 8.5 7 8.5Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Repeater', '@@text_domain' );
        $this->category     = __( 'Layout', '@@text_domain' );
        $this->restrictions = array(
            'as_child'          => false,
            'default_settings'  => false,
            'required_settings' => false,
            'help_settings'     => false,
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
        add_filter( 'lzb/block_render/attributes', array( $this, 'filter_lzb_block_render_attributes' ), 10, 3 );
        add_filter( 'lzb/get_meta', array( $this, 'filter_get_lzb_meta_json' ), 10, 4 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-repeater',
            lazyblocks()->plugin_url . 'controls/repeater/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components' ),
            '@@plugin_version',
            true
        );
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
     * @param string $attribute_data - attribute data.
     * @param array  $control - control data.
     * @param array  $controls - all controls.
     * @param string $control_id - current control id.
     * @param array  $block - block data.
     *
     * @return array filtered attribute data.
     */
    public function filter_lzb_prepare_block_attribute( $attribute_data, $control, $controls, $control_id, $block ) {
        if (
            ! $control ||
            ! isset( $control['type'] ) ||
            $this->name !== $control['type']
        ) {
            return $attribute_data;
        }

        $default_val  = array();
        $inner_blocks = lazyblocks()->blocks()->prepare_block_attributes( $controls, $control_id, $block );

        foreach ( $inner_blocks as $n => $inner_block ) {
            $default_val[ $n ] = $inner_blocks[ $n ]['default'];
        }

        $attribute_data['default'] = rawurlencode( wp_json_encode( array( $default_val ) ) );

        return $attribute_data;
    }

    /**
     * Change block render attribute to array.
     *
     * @param string $attributes - block attributes.
     * @param mixed  $content - block content.
     * @param mixed  $block - block data.
     *
     * @return array filtered attribute data.
     */
    public function filter_lzb_block_render_attributes( $attributes, $content, $block ) {
        if ( ! isset( $block['controls'] ) || empty( $block['controls'] ) ) {
            return $attributes;
        }

        // prepare decoded array to actual array.
        foreach ( $block['controls'] as $control ) {
            if ( $this->name === $control['type'] && isset( $attributes[ $control['name'] ] ) && is_string( $attributes[ $control['name'] ] ) ) {
                $attributes[ $control['name'] ] = json_decode( rawurldecode( $attributes[ $control['name'] ] ), true );
            }
        }

        return $attributes;
    }

    /**
     * Change get_lzb_meta output to array.
     *
     * @param string $result - meta data.
     * @param string $name - meta name.
     * @param mixed  $id - post id.
     * @param mixed  $control - control data.
     *
     * @return array filtered meta.
     */
    public function filter_get_lzb_meta_json( $result, $name, $id, $control ) {
        if ( ! $control || $this->name !== $control['type'] ) {
            return $result;
        }

        return json_decode( urldecode( $result ), true );
    }
}

new LazyBlocks_Control_Repeater();
