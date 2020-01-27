<?php
/**
 * Toggle Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Toggle class.
 */
class LazyBlocks_Control_Toggle extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'toggle';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 6H7C3.69 6 1 8.69 1 12C1 15.31 3.69 18 7 18H17C20.31 18 23 15.31 23 12C23 8.69 20.31 6 17 6ZM17 16H7C4.79 16 3 14.21 3 12C3 9.79 4.79 8 7 8H17C19.21 8 21 9.79 21 12C21 14.21 19.21 16 17 16ZM7 9C5.34 9 4 10.34 4 12C4 13.66 5.34 15 7 15C8.66 15 10 13.66 10 12C10 10.34 8.66 9 7 9Z" fill="currentColor"/></svg>';
        $this->type         = 'boolean';
        $this->label        = __( 'Toggle', '@@text_domain' );
        $this->category     = __( 'Choice', '@@text_domain' );
        $this->restrictions = array(
            'default_settings' => false,
        );
        $this->attributes   = array(
            'checked'        => 'false',
            'alongside_text' => '',
        );

        // Filters.
        add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );
        add_filter( 'lzb/get_meta', array( $this, 'filter_get_lzb_meta_default' ) );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-toggle',
            lazyblocks()->plugin_url . 'controls/toggle/script.min.js',
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
        return array( 'lazyblocks-control-toggle' );
    }

    /**
     * Filter block attribute.
     *
     * @param string $attribute_data - attribute data.
     * @param mixed  $control - control data.
     *
     * @return array filtered attribute data.
     */
    public function filter_lzb_prepare_block_attribute( $attribute_data, $control ) {
        if (
            ! $control ||
            ! isset( $control['type'] ) ||
            $this->name !== $control['type'] ||
            ! isset( $control['checked'] )
        ) {
            return $attribute_data;
        }

        if ( ! isset( $attribute_data['default'] ) || ! is_bool( $attribute_data['default'] ) ) {
            $attribute_data['default'] = 'true' === $control['checked'];
        }

        return $attribute_data;
    }

    /**
     * Change get_lzb_meta output to boolean.
     *
     * @param string $result - meta data.
     * @param string $name - meta name.
     * @param mixed  $id - post id.
     * @param mixed  $control - control data.
     *
     * @return array filtered meta.
     */
    public function filter_get_lzb_meta_default( $result, $name, $id, $control ) {
        if ( ! $control || $this->name !== $control['type'] || ! isset( $control['checked'] ) ) {
            return $result;
        }

        if ( ! isset( $result ) || ! is_bool( $result ) ) {
            $result = 'true' === $control['checked'];
        }

        return $result;
    }
}

new LazyBlocks_Control_Toggle();
