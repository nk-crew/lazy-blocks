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
        $this->type         = 'boolean';
        $this->label        = __( 'Checkbox', '@@text_domain' );
        $this->category     = __( 'Choice', '@@text_domain' );
        $this->restrictions = array(
            'default_settings' => false,
        );
        $this->attributes   = array(
            'checked' => 'false',
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
            'lazyblocks-control-checkbox',
            lazyblocks()->plugin_url . 'controls/checkbox/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components' ),
            '@@plugin_version'
        );
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

new LazyBlocks_Control_Checkbox();
