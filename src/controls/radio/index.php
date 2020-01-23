<?php
/**
 * Radio Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Radio class.
 */
class LazyBlocks_Control_Radio extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'radio';
        $this->type       = 'string';
        $this->label      = __( 'Radio', '@@text_domain' );
        $this->category   = __( 'Choice', '@@text_domain' );
        $this->attributes = array(
            'choices'    => array(),
            'allow_null' => 'false',
            'multiple'   => 'false',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-radio',
            lazyblocks()->plugin_url . 'controls/radio/script.min.js',
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
        return array( 'lazyblocks-control-radio' );
    }
}

new LazyBlocks_Control_Radio();
