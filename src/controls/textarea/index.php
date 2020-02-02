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
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.66667 6.30769V10.9231C8.38333 10.9231 7.33333 9.88462 7.33333 8.61538C7.33333 7.34615 8.38333 6.30769 9.66667 6.30769ZM19 4H9.66667C7.08833 4 5 6.06538 5 8.61538C5 11.1654 7.08833 13.2308 9.66667 13.2308V19H12V6.30769H14.3333V19H16.6667V6.30769H19V4Z" fill="currentColor"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Text Area', '@@text_domain' );
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
            lazyblocks()->plugin_url() . 'controls/textarea/script.min.js',
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
