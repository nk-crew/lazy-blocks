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
        );

        // Filters.
        add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-checkbox',
            lazyblocks()->plugin_url() . 'dist/controls/checkbox/script.min.js',
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
}

new LazyBlocks_Control_Checkbox();
