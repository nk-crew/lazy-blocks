<?php
/**
 * Text Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Text class.
 */
class LazyBlocks_Control_Text extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'text';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99988 19.25H12.9999" stroke="currentColor" stroke-width="1.5"/><path d="M3.99988 15.25H19.9999" stroke="currentColor" stroke-width="1.5"/><path d="M8.99429 10.1029H6.08L5.41714 12H4L6.84572 4H8.22857L11.0743 12H9.65714L8.99429 10.1029ZM8.53714 8.82286L7.54286 5.96571L6.53714 8.82286H8.53714Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Text', 'lazy-blocks' );
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
            'lazyblocks-control-text',
            lazyblocks()->plugin_url() . 'dist/controls/text/script.min.js',
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
        return array( 'lazyblocks-control-text' );
    }
}

new LazyBlocks_Control_Text();
