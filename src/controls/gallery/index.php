<?php
/**
 * Gallery Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Gallery class.
 */
class LazyBlocks_Control_Gallery extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'gallery';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4V16H8V4H20ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM11.5 11.67L13.19 13.93L15.67 10.83L19 15H9L11.5 11.67ZM2 6V20C2 21.1 2.9 22 4 22H18V20H4V6H2Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Gallery', '@@text_domain' );
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
            'lazyblocks-control-gallery',
            lazyblocks()->plugin_url() . 'controls/gallery/script.min.js',
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
        return array( 'lazyblocks-control-gallery' );
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
                $data['url']         = $attachment->guid;
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
                $attributes[ $control['name'] ] = json_decode( rawurldecode( $attributes[ $control['name'] ] ), true );

                if ( ! empty( $attributes[ $control['name'] ] ) ) {
                    $new_result = array();

                    foreach ( $attributes[ $control['name'] ] as $k => $val ) {
                        $new_result[ $k ] = $this->maybe_update_image_data( $val );
                    }

                    $attributes[ $control['name'] ] = $new_result;
                }
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

        $result = json_decode( urldecode( $result ), true );

        if ( ! empty( $result ) ) {
            $new_result = array();

            foreach ( $result as $k => $val ) {
                $new_result[ $k ] = $this->maybe_update_image_data( $val );
            }

            $result = $new_result;
        }

        return json_decode( urldecode( $result ), true );
    }
}

new LazyBlocks_Control_Gallery();
