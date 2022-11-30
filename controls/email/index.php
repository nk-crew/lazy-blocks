<?php
/**
 * Email Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Email class.
 */
class LazyBlocks_Control_Email extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'email';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99988 19.25H12.9999" stroke="currentColor" stroke-width="1.5"/><path d="M3.99988 15.25H19.9999" stroke="currentColor" stroke-width="1.5"/><path d="M13.6379 4H5.36207C4.88596 4 4.5 4.37309 4.5 4.83333V10.1667C4.5 10.6269 4.88596 11 5.36207 11H13.6379C14.1141 11 14.5 10.6269 14.5 10.1667V4.83333C14.5 4.37309 14.1141 4 13.6379 4Z" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 4L9.5 8L14.5 4" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Email', 'lazy-blocks' );
        $this->attributes   = array(
            'placeholder'      => '',
            'characters_limit' => '',
        );
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
            'lazyblocks-control-email',
            lazyblocks()->plugin_url() . 'dist/controls/email/script.min.js',
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
        return array( 'lazyblocks-control-email' );
    }
}

new LazyBlocks_Control_Email();
