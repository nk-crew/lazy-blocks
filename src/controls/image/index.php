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
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Image', '@@text_domain' );
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
            lazyblocks()->plugin_url() . 'controls/image/script.min.js',
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
                $attributes[ $control['name'] ] = $this->maybe_update_image_data( json_decode( rawurldecode( $attributes[ $control['name'] ] ), true ) );
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

        return $this->maybe_update_image_data( json_decode( urldecode( $result ), true ) );
    }
}

new LazyBlocks_Control_Image();
