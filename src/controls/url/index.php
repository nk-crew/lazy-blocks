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
        $this->name     = 'url';
        $this->type     = 'string';
        $this->label    = __( 'URL', '@@text_domain' );
        $this->category = __( 'Basic', '@@text_domain' );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-url',
            lazyblocks()->plugin_url . 'controls/url/script.min.js',
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
        return array( 'lazyblocks-control-url' );
    }
}

new LazyBlocks_Control_URL();
