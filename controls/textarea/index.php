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
        $this->name         = 'textarea';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.2501H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 14.4167H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 9.58337H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 4.75H16" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Text Area', 'lazy-blocks' );
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
            'lazyblocks-control-textarea',
            lazyblocks()->plugin_url() . 'dist/controls/textarea/script.min.js',
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
        return array( 'lazyblocks-control-textarea' );
    }
}

new LazyBlocks_Control_TextArea();
