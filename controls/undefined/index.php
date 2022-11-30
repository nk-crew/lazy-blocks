<?php
/**
 * Undefined Control used when used a custom control, which is not available.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Undefined class.
 */
class LazyBlocks_Control_Undefined extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'undefined';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><path d="M10.956 14.2209V14.1009C10.959 13.5438 11.0114 13.1006 11.1129 12.7713C11.2176 12.442 11.3653 12.1773 11.5561 11.9773C11.7469 11.7742 11.9793 11.588 12.2532 11.4187C12.4409 11.3017 12.6087 11.174 12.7564 11.0355C12.9072 10.8939 13.0257 10.737 13.1119 10.5646C13.198 10.3892 13.2411 10.1938 13.2411 9.97834C13.2411 9.73521 13.1842 9.52439 13.0703 9.34589C12.9564 9.16738 12.8026 9.02889 12.6087 8.9304C12.4179 8.83192 12.204 8.78268 11.967 8.78268C11.7485 8.78268 11.5407 8.83038 11.3438 8.92579C11.1499 9.01812 10.9883 9.15969 10.859 9.3505C10.7328 9.53824 10.6621 9.77676 10.6467 10.0661H9.0032C9.01858 9.4813 9.16016 8.99196 9.42791 8.59802C9.69875 8.20408 10.0558 7.90862 10.4989 7.71165C10.9452 7.51468 11.4376 7.4162 11.9762 7.4162C12.564 7.4162 13.0811 7.5193 13.5273 7.7255C13.9767 7.93171 14.326 8.22562 14.5753 8.60725C14.8277 8.9858 14.9538 9.43514 14.9538 9.95526C14.9538 10.3061 14.8969 10.62 14.783 10.897C14.6722 11.174 14.5137 11.4202 14.3075 11.6357C14.1013 11.8511 13.8567 12.0434 13.5735 12.2127C13.3242 12.3666 13.1196 12.5266 12.9595 12.6928C12.8026 12.859 12.6856 13.0545 12.6087 13.2791C12.5348 13.5007 12.4963 13.7746 12.4933 14.1009V14.2209H10.956ZM11.7592 17.1016C11.4822 17.1016 11.2437 17.0031 11.0437 16.8061C10.8436 16.6091 10.7436 16.3691 10.7436 16.0859C10.7436 15.809 10.8436 15.572 11.0437 15.375C11.2437 15.178 11.4822 15.0796 11.7592 15.0796C12.0331 15.0796 12.2701 15.178 12.4702 15.375C12.6733 15.572 12.7749 15.809 12.7749 16.0859C12.7749 16.2737 12.7272 16.4445 12.6317 16.5984C12.5394 16.7523 12.4163 16.8754 12.2624 16.9677C12.1116 17.0569 11.9439 17.1016 11.7592 17.1016Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Undefined', 'lazy-blocks' );
        $this->restrictions = array(
            'hidden_from_select'            => true,
            'name_settings'                 => false,
            'default_settings'              => false,
            'help_settings'                 => false,
            'width_settings'                => false,
            'required_settings'             => false,
            'translate_settings'            => false,
            'hide_if_not_selected_settings' => false,
            'save_in_meta_settings'         => false,
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-undefined',
            lazyblocks()->plugin_url() . 'dist/controls/undefined/script.min.js',
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
        return array( 'lazyblocks-control-undefined' );
    }
}

new LazyBlocks_Control_Undefined();
