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
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11ZM21 6V20C21 21.1 20.1 22 19 22H5C3.89 22 3 21.1 3 20L3.01 6C3.01 4.9 3.89 4 5 4H6V2H8V4H16V2H18V4H19C20.1 4 21 4.9 21 6ZM5 8H19V6H5V8ZM19 20V10H5V20H19ZM15 13H17V11H15V13ZM11 13H13V11H11V13Z" fill="currentColor"/></svg>';
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
