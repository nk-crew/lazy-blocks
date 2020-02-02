<?php
/**
 * URL Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_URL class.
 */
class LazyBlocks_Control_URL extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name  = 'url';
        $this->icon  = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.92892L9.17158 7.75735L10.5858 9.17156L13.4142 6.34313C14.5809 5.17641 16.4901 5.17641 17.6569 6.34313C18.8236 7.50986 18.8236 9.41905 17.6569 10.5858L14.8284 13.4142L16.2426 14.8284L19.0711 12C21.0227 10.0484 21.0227 6.88054 19.0711 4.92892C17.1195 2.97731 13.9516 2.97731 12 4.92892ZM13.4142 14.8284L10.5858 17.6568C9.41906 18.8236 7.50988 18.8236 6.34315 17.6568C5.17642 16.4901 5.17642 14.5809 6.34315 13.4142L9.17158 10.5858L7.75736 9.17156L4.92894 12C2.97732 13.9516 2.97732 17.1194 4.92894 19.0711C6.88055 21.0227 10.0484 21.0227 12 19.0711L14.8284 16.2426L13.4142 14.8284ZM8.46447 14.1213L14.1213 8.46445L15.5355 9.87867L9.87868 15.5355L8.46447 14.1213Z" fill="currentColor"/></svg>';
        $this->type  = 'string';
        $this->label = __( 'URL', '@@text_domain' );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-url',
            lazyblocks()->plugin_url() . 'controls/url/script.min.js',
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
        return array( 'lazyblocks-control-url' );
    }
}

new LazyBlocks_Control_URL();
