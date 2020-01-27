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
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 12L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 12L6 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="8.5" cy="12" r="2.25" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type       = 'number';
        $this->label      = __( 'Range', '@@text_domain' );
        $this->category   = __( 'Basic', '@@text_domain' );
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
            lazyblocks()->plugin_url . 'controls/range/script.min.js',
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
        return array( 'lazyblocks-control-range' );
    }
}

new LazyBlocks_Control_Range();
