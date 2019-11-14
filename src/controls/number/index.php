<?php
/**
 * Number Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Number class.
 */
class LazyBlocks_Control_Number extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'number';
        $this->type       = 'number';
        $this->label      = __( 'Number', '@@text_domain' );
        $this->category   = __( 'Basic', '@@text_domain' );
        $this->attributes = array(
            'min'         => '',
            'max'         => '',
            'step'        => '',
            'placeholder' => '',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-number',
            lazyblocks()->plugin_url . 'controls/number/script.min.js',
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
        return array( 'lazyblocks-control-number' );
    }
}

new LazyBlocks_Control_Number();
