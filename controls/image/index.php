<?php
/**
 * Image Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Image class.
 */
class LazyBlocks_Control_Image extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'image';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19 4.5H5C4.72386 4.5 4.5 4.72386 4.5 5V19C4.5 19.2761 4.72386 19.5 5 19.5H19C19.2761 19.5 19.5 19.2761 19.5 19V5C19.5 4.72386 19.2761 4.5 19 4.5ZM5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.4772 10.4623C15.7683 10.1792 16.2317 10.1792 16.5228 10.4623L20.5228 14.3511L19.4772 15.4266L16 12.046L12.5228 15.4266C12.2719 15.6706 11.8857 15.7086 11.5921 15.5183L8.59643 13.5766L4.44186 16.606L3.55811 15.394L8.12953 12.0607C8.38061 11.8776 8.71858 11.8683 8.97934 12.0373L11.906 13.9342L15.4772 10.4623Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Image', 'lazy-blocks' );
        $this->category     = 'content';
        $this->restrictions = array(
            'default_settings' => false,
        );
        $this->attributes   = array(
            'preview_size' => 'medium',
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
            'lazyblocks-control-image',
            lazyblocks()->plugin_url() . 'dist/controls/image/script.min.js',
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
        return array( 'lazyblocks-control-image' );
    }

    /**
     * Lets get actual image data from DB.
     *
     * @param array $data image data.
     *
     * @return array
     */
    public function maybe_update_image_data( $data ) {
        if ( isset( $data['id'] ) ) {
            $attachment_meta = wp_get_attachment_metadata( $data['id'] );

            if ( ! empty( $attachment_meta ) ) {
                $attachment = get_post( $data['id'] );

                if ( isset( $attachment_meta['sizes'] ) ) {
                    $sizes = array();

                    foreach ( $attachment_meta['sizes'] as $name => $size ) {
                        $sizes[ $name ] = array(
                            'width'       => $size['width'],
                            'height'      => $size['height'],
                            'url'         => wp_get_attachment_image_url( $data['id'], $name ),
                            'orientation' => $size['width'] >= $size['height'] ? 'landscape' : 'portrait',
                        );
                    }

                    $data['sizes'] = $sizes;
                }

                $data['alt']         = get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true );
                $data['caption']     = $attachment->post_excerpt;
                $data['description'] = $attachment->post_content;
                $data['title']       = get_the_title( $attachment->ID );
                $data['url']         = wp_get_attachment_image_url( $attachment->ID, 'full' );
                $data['link']        = get_permalink( $attachment->ID );
            }
        }

        return $data;
    }

    /**
     * Change block render attribute to array.
     *
     * @param array $attributes - block attributes.
     * @param mixed $content - block content.
     * @param mixed $block - block data.
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
                $attributes[ $control['name'] ] = $this->maybe_update_image_data( json_decode( rawurldecode( $attributes[ $control['name'] ] ), true ) );
            }
        }

        return $attributes;
    }

    /**
     * Change get_lzb_meta output to array.
     *
     * @param array  $result - meta data.
     * @param string $name - meta name.
     * @param mixed  $id - post id.
     * @param mixed  $control - control data.
     *
     * @return array filtered meta.
     */
    public function filter_get_lzb_meta_json( $result, $name, $id, $control ) {
        if ( ! $control || $this->name !== $control['type'] || ! is_string( $result ) ) {
            return $result;
        }

        return $this->maybe_update_image_data( json_decode( urldecode( $result ), true ) );
    }
}

new LazyBlocks_Control_Image();
