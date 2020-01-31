<?php
/**
 * InnerBlocks Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_InnerBlocks class.
 */
class LazyBlocks_Control_InnerBlocks extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'inner_blocks';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8H14V11H11V13H14V16H16V13H19V11H16V8ZM2 12C2 9.21 3.64 6.8 6.01 5.68V3.52C2.52 4.76 0 8.09 0 12C0 15.91 2.52 19.24 6.01 20.48V18.32C3.64 17.2 2 14.79 2 12ZM15 3C10.04 3 6 7.04 6 12C6 16.96 10.04 21 15 21C19.96 21 24 16.96 24 12C24 7.04 19.96 3 15 3ZM15 19C11.14 19 8 15.86 8 12C8 8.14 11.14 5 15 5C18.86 5 22 8.14 22 12C22 15.86 18.86 19 15 19Z" fill="currentColor"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Inner Blocks', '@@text_domain' );
        $this->category     = __( 'Content', '@@text_domain' );
        $this->restrictions = array(
            'once'                  => true,
            'as_child'              => false,
            'default_settings'      => false,
            'required_settings'     => false,
            'help_settings'         => false,
            'save_in_meta_settings' => false,
            'placement_settings'    => array( 'content' ),
        );

        // Filters.
        add_filter( 'lzb/block_render/attributes', array( $this, 'filter_lzb_block_render_attributes' ), 10, 3 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-inner-blocks',
            lazyblocks()->plugin_url() . 'controls/inner_blocks/script.min.js',
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
        return array( 'lazyblocks-control-inner-blocks' );
    }

    /**
     * Change block render attribute to inner content.
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
            if ( $this->name === $control['type'] ) {
                $attributes[ $control['name'] ] = $content ? $content : '';
            }
        }

        return $attributes;
    }
}

new LazyBlocks_Control_InnerBlocks();
