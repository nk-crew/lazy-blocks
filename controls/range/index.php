<?php
/**
 * Range Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Range class.
 */
class LazyBlocks_Control_Range extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'range';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99988 17H19.9999" stroke="currentColor" stroke-width="1.5"/><path d="M3.87713 12H5.46449L8.48295 6.00213V4.72727H3.37997V5.98438H6.89205V6.03409L3.87713 12ZM10.0137 12H11.6011L14.6195 6.00213V4.72727H9.51655V5.98438H13.0286V6.03409L10.0137 12Z" fill="currentColor"/><circle cx="16" cy="17" r="1.5" fill="white" stroke="currentColor"/></svg>';
        $this->type       = 'number';
        $this->label      = __( 'Range', 'lazy-blocks' );
        $this->attributes = array(
            'min'  => '',
            'max'  => '',
            'step' => '',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-range',
            lazyblocks()->plugin_url() . 'dist/controls/range/script.min.js',
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
        return array( 'lazyblocks-control-range' );
    }
}

new LazyBlocks_Control_Range();
