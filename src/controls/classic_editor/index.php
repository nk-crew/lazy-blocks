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
        $this->name     = 'classic_editor';
        $this->icon     = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false"><path d="M0,0h24v24H0V0z M0,0h24v24H0V0z" fill="none"></path><path d="m20 7v10h-16v-10h16m0-2h-16c-1.1 0-1.99 0.9-1.99 2l-0.01 10c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2v-10c0-1.1-0.9-2-2-2z"></path><rect x="11" y="8" width="2" height="2"></rect><rect x="11" y="11" width="2" height="2"></rect><rect x="8" y="8" width="2" height="2"></rect><rect x="8" y="11" width="2" height="2"></rect><rect x="5" y="11" width="2" height="2"></rect><rect x="5" y="8" width="2" height="2"></rect><rect x="8" y="14" width="8" height="2"></rect><rect x="14" y="11" width="2" height="2"></rect><rect x="14" y="8" width="2" height="2"></rect><rect x="17" y="11" width="2" height="2"></rect><rect x="17" y="8" width="2" height="2"></rect></svg>';
        $this->type     = 'string';
        $this->label    = __( 'Classic Editor (WYSIWYG)', '@@text_domain' );
        $this->category = __( 'Content', '@@text_domain' );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-classic-editor',
            lazyblocks()->plugin_url() . 'controls/classic_editor/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components', 'wp-keycodes' ),
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
        return array( 'lazyblocks-control-classic-editor' );
    }
}

new LazyBlocks_Control_ClassicEditor();
