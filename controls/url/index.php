<?php
/**
 * URL Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_URL class.
 */
class LazyBlocks_Control_URL extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'url';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99988 19.25H12.9999" stroke="currentColor" stroke-width="1.5"/><path d="M3.99988 15.25H19.9999" stroke="currentColor" stroke-width="1.5"/><path d="M11.1666 5.00012H11.7222C13.2563 5.00012 14.4999 6.24377 14.4999 7.7779C14.4999 9.31202 13.2563 10.5556 11.7222 10.5556H11.1666" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/><path d="M7.83332 10.5555H7.27776C5.74365 10.5555 4.5 9.3119 4.5 7.77778C4.49999 6.24365 5.74365 5 7.27776 5H7.83332" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/><path d="M7.83332 7.86478H11.1667" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'URL', 'lazy-blocks' );
        $this->restrictions = array(
            'translate_settings' => true,
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-url',
            lazyblocks()->plugin_url() . 'dist/controls/url/script.min.js',
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
        return array( 'lazyblocks-control-url' );
    }
}

new LazyBlocks_Control_URL();
