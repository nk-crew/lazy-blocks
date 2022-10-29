<?php
/**
 * Password Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Password class.
 */
class LazyBlocks_Control_Password extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'password';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99988 19.25H12.9999" stroke="currentColor" stroke-width="1.5"/><path d="M3.99988 15.25H19.9999" stroke="currentColor" stroke-width="1.5"/><path d="M6.52095 10.2273H7.95384L7.81534 8.16584L9.54119 9.32173L10.255 8.06463L8.40128 7.15909L10.255 6.25355L9.54119 4.99645L7.81534 6.15234L7.95384 4.09091H6.52095L6.65412 6.15234L4.92827 4.99645L4.21449 6.25355L6.07351 7.15909L4.21449 8.06463L4.92827 9.32173L6.65412 8.16584L6.52095 10.2273Z" fill="currentColor"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Password', 'lazy-blocks' );
        $this->attributes = array(
            'placeholder'      => '',
            'characters_limit' => '',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-password',
            lazyblocks()->plugin_url() . 'dist/controls/password/script.min.js',
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
        return array( 'lazyblocks-control-password' );
    }
}

new LazyBlocks_Control_Password();
