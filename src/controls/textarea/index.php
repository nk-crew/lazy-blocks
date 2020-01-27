<?php
/**
 * Textarea Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_TextArea class.
 */
class LazyBlocks_Control_TextArea extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'textarea';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Text Area', '@@text_domain' );
        $this->category   = __( 'Basic', '@@text_domain' );
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
            'lazyblocks-control-textarea',
            lazyblocks()->plugin_url . 'controls/textarea/script.min.js',
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
        return array( 'lazyblocks-control-textarea' );
    }
}

new LazyBlocks_Control_TextArea();
