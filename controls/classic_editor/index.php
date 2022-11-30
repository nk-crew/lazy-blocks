<?php
/**
 * Classic Editor Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_ClassicEditor class.
 */
class LazyBlocks_Control_ClassicEditor extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'classic_editor';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.75H20C20.6904 6.75 21.25 7.30964 21.25 8V17C21.25 17.6904 20.6904 18.25 20 18.25H4C3.30964 18.25 2.75 17.6904 2.75 17V8C2.75 7.30964 3.30964 6.75 4 6.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M10 10H8V12H10V10Z" fill="currentColor"/><path d="M7 10H5V12H7V10Z" fill="currentColor"/><path d="M13 10H11V12H13V10Z" fill="currentColor"/><path d="M16 14H8V16H16V14Z" fill="currentColor"/><path d="M16 10H14V12H16V10Z" fill="currentColor"/><path d="M19 10H17V12H19V10Z" fill="currentColor"/><path d="M19 14H17V16H19V14Z" fill="currentColor"/><path d="M7 14H5V16H7V14Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Classic Editor (WYSIWYG)', 'lazy-blocks' );
        $this->category     = 'content';
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
            'lazyblocks-control-classic-editor',
            lazyblocks()->plugin_url() . 'dist/controls/classic_editor/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-keycodes' ),
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
        return array( 'lazyblocks-control-classic-editor' );
    }
}

new LazyBlocks_Control_ClassicEditor();
