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
            lazyblocks()->plugin_url() . 'dist/controls/repeater/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components' ),
            LAZY_BLOCKS_VERSION,
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
     * @param array  $attribute_data - attribute data.
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

        $attribute_data['default'] = rawurlencode( wp_json_encode( array() ) );

        return $attribute_data;
    }

    /**
     * Change block render attribute to array.
     *
     * @param array $attributes - block attributes.
     * @param mixed $content - block content.
     * @param mixed $block - block data.
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
     * @param array  $result - meta data.
     * @param string $name - meta name.
     * @param mixed  $id - post id.
     * @param mixed  $control - control data.
     *
     * @return array filtered meta.
     */
    public function filter_get_lzb_meta_json( $result, $name, $id, $control ) {
        if ( ! $control || $this->name !== $control['type'] || ! is_string( $result ) ) {
            return $result;
        }

        return json_decode( urldecode( $result ), true );
    }
}

new LazyBlocks_Control_Repeater();
