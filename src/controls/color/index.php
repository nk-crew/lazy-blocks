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
     * Constructor
     */
    public function __construct() {
        $this->name       = 'color';
        $this->type       = 'string';
        $this->label      = __( 'Color Picker', '@@text_domain' );
        $this->category   = __( 'Advanced', '@@text_domain' );
        $this->attributes = array(
            'alpha' => 'false',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-color',
            lazyblocks()->plugin_url . 'controls/color/script.min.js',
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
        return array( 'lazyblocks-control-color' );
    }
}

new LazyBlocks_Control_Color();
