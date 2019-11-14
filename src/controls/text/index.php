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
        $this->name       = 'text';
        $this->type       = 'string';
        $this->label      = __( 'Text', '@@text_domain' );
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
            'lazyblocks-control-text',
            lazyblocks()->plugin_url . 'controls/text/script.min.js',
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
        return array( 'lazyblocks-control-text' );
    }
}

new LazyBlocks_Control_Text();
