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
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.1903 16.614C18.2623 16.77 18.2983 16.926 18.2983 17.082C18.2983 17.358 18.1843 17.592 17.9563 17.784C17.7403 17.976 17.4883 18.072 17.2003 18.072C17.0083 18.072 16.8283 18.024 16.6603 17.928C16.4923 17.82 16.3603 17.658 16.2643 17.442L15.1843 15.03H8.84831L7.76831 17.442C7.67231 17.658 7.54031 17.82 7.37231 17.928C7.20431 18.024 7.01831 18.072 6.81431 18.072C6.53831 18.072 6.28631 17.976 6.05831 17.784C5.83031 17.592 5.71631 17.358 5.71631 17.082C5.71631 16.926 5.75231 16.77 5.82431 16.614L10.7923 5.94C10.9003 5.7 11.0623 5.52 11.2783 5.4C11.5063 5.268 11.7463 5.202 11.9983 5.202C12.2503 5.202 12.4843 5.268 12.7003 5.4C12.9283 5.52 13.0963 5.7 13.2043 5.94L18.1903 16.614ZM14.3923 13.23L12.0163 7.884L9.64031 13.23H14.3923Z" fill="currentColor"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Text', '@@text_domain' );
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
            lazyblocks()->plugin_url() . 'controls/text/script.min.js',
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
        return array( 'lazyblocks-control-text' );
    }
}

new LazyBlocks_Control_Text();
