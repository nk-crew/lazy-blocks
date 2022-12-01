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
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><path d="M5.34267 4C3.30367 5.64996 2 9.17273 2 12C2 14.8273 3.30367 18.35 5.34267 20" stroke="currentColor" stroke-width="1.5"/><path d="M9 12H19" stroke="currentColor" stroke-width="1.5"/><path d="M14 7V17" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type         = 'string';
        $this->label        = __( 'Inner Blocks', 'lazy-blocks' );
        $this->category     = 'content';
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
            lazyblocks()->plugin_url() . 'dist/controls/inner_blocks/script.min.js',
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
        return array( 'lazyblocks-control-inner-blocks' );
    }

    /**
     * Change block render attribute to inner content.
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

        // prepare inner-blocks content to actual attribute.
        foreach ( $block['controls'] as $control ) {
            if ( $this->name === $control['type'] ) {
                $attributes[ $control['name'] ] = $content ? $content : '';
            }
        }

        return $attributes;
    }
}

new LazyBlocks_Control_InnerBlocks();
