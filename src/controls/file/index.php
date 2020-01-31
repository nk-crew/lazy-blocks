<?php
/**
 * File Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_File class.
 */
class LazyBlocks_Control_File extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'file';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM6 20V4H13V9H18V20H6Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'File', '@@text_domain' );
        $this->category     = __( 'Content', '@@text_domain' );
        $this->restrictions = array(
            'default_settings' => false,
        );
        $this->attributes   = array(
            'allowed_mime_types' => array(),
        );

        // Filters.
        add_filter( 'lzb/block_render/attributes', array( $this, 'filter_lzb_block_render_attributes' ), 10, 3 );
        add_filter( 'lzb/get_meta', array( $this, 'filter_get_lzb_meta_json' ), 10, 4 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-file',
            lazyblocks()->plugin_url() . 'controls/file/script.min.js',
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
        return array( 'lazyblocks-control-file' );
    }

    /**
     * Change block render attribute to array.
     *
     * @param string $attributes - block attributes.
     * @param mixed  $content - block content.
     * @param mixed  $block - block data.
     *
     * @return array filtered attribute data.
     */
    public function filter_lzb_block_render_attributes( $attributes, $content, $block ) {
        if ( ! isset( $block['controls'] ) || empty( $block['controls'] ) ) {
            return $attributes;
        }

        // prepare decoded array to actual array.
        foreach ( $block['controls'] as $control ) {
            if ( $this->name === $control['type'] && isset( $attributes[ $control['name'] ] ) && is_string( $attributes[ $control['name'] ] ) ) {
                $attributes[ $control['name'] ] = json_decode( rawurldecode( $attributes[ $control['name'] ] ), true );
            }
        }

        return $attributes;
    }

    /**
     * Change get_lzb_meta output to array.
     *
     * @param string $result - meta data.
     * @param string $name - meta name.
     * @param mixed  $id - post id.
     * @param mixed  $control - control data.
     *
     * @return array filtered meta.
     */
    public function filter_get_lzb_meta_json( $result, $name, $id, $control ) {
        if ( ! $control || $this->name !== $control['type'] ) {
            return $result;
        }

        return json_decode( urldecode( $result ), true );
    }
}

new LazyBlocks_Control_File();
