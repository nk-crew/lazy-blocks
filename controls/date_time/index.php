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
        $this->name         = 'date_time';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3.75H19C19.6904 3.75 20.25 4.30964 20.25 5V19C20.25 19.6904 19.6904 20.25 19 20.25H5C4.30964 20.25 3.75 19.6904 3.75 19V5C3.75 4.30964 4.30964 3.75 5 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7H3V5Z" fill="currentColor"/><path d="M9 10H7V12H9V10Z" fill="currentColor"/><path d="M9 14H7V16H9V14Z" fill="currentColor"/><path d="M13 10H11V12H13V10Z" fill="currentColor"/><path d="M17 10H15V12H17V10Z" fill="currentColor"/><path d="M13 14H11V16H13V14Z" fill="currentColor"/><path d="M17 14H15V16H17V14Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Date Time Picker', 'lazy-blocks' );
        $this->category     = 'advanced';
        $this->attributes   = array(
            'date_time_picker' => 'date_time',
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
            'lazyblocks-control-date-time',
            lazyblocks()->plugin_url() . 'dist/controls/date_time/script.min.js',
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
        return array( 'lazyblocks-control-date-time' );
    }
}

new LazyBlocks_Control_DateTime();
