<?php
/**
 * CodeEditor Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_CodeEditor class.
 */
class LazyBlocks_Control_CodeEditor extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'code_editor';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6V16.6Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Code Editor', '@@text_domain' );
        $this->category     = __( 'Content', '@@text_domain' );
        $this->restrictions = array(
            'default_settings' => false,
        );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-code-editor',
            lazyblocks()->plugin_url() . 'controls/code_editor/script.min.js',
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
        return array( 'lazyblocks-control-code-editor' );
    }
}

new LazyBlocks_Control_CodeEditor();
