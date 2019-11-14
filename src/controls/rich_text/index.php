<?php
/**
 * RichText Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_RichText class.
 */
class LazyBlocks_Control_RichText extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'rich_text';
        $this->type       = 'string';
        $this->label      = __( 'Rich Text (WYSIWYG)', '@@text_domain' );
        $this->category   = __( 'Content', '@@text_domain' );
        $this->attributes = array(
            'multiline' => 'false',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-rich-text',
            lazyblocks()->plugin_url . 'controls/rich_text/script.min.js',
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
        return array( 'lazyblocks-control-rich-text' );
    }
}

new LazyBlocks_Control_RichText();
