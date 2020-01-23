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
            lazyblocks()->plugin_url . 'controls/inner_blocks/script.min.js',
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
