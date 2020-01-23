<?php
/**
 * DateTime Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_DateTime class.
 */
class LazyBlocks_Control_DateTime extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'date_time';
        $this->type       = 'string';
        $this->label      = __( 'Date Time Picker', '@@text_domain' );
        $this->category   = __( 'Advanced', '@@text_domain' );
        $this->attributes = array(
            'date_time_picker' => 'date_time',
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-date-time',
            lazyblocks()->plugin_url . 'controls/date_time/script.min.js',
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
        return array( 'lazyblocks-control-date-time' );
    }
}

new LazyBlocks_Control_DateTime();
