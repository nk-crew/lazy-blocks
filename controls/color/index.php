<?php
/**
 * Color Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Color class.
 */
class LazyBlocks_Control_Color extends LazyBlocks_Control {
    /**
     * Saved color palette
     *
     * @var false|array
     */
    public $color_palette = false;

    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'color';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4405 13.9048C17.4405 16.8569 15.0473 19.25 12.0952 19.25C9.14314 19.25 6.75 16.8569 6.75 13.9048C6.75 13.2532 7.05742 12.3484 7.61616 11.2861C8.16265 10.2472 8.89988 9.14863 9.65011 8.13668C10.3983 7.12748 11.1482 6.21939 11.7119 5.56279C11.8524 5.3991 11.9812 5.25128 12.0952 5.12167C12.2093 5.25128 12.338 5.3991 12.4786 5.56279C13.0423 6.21939 13.7922 7.12748 14.5404 8.13668C15.2906 9.14863 16.0278 10.2472 16.5743 11.2861C17.1331 12.3484 17.4405 13.2532 17.4405 13.9048Z" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Color Picker', 'lazy-blocks' );
        $this->category   = 'advanced';
        $this->attributes = array(
            'alpha'         => 'false',
            'output_format' => '',
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
            'lazyblocks-control-color',
            lazyblocks()->plugin_url() . 'dist/controls/color/script.min.js',
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
        return array( 'lazyblocks-control-color' );
    }

    /**
     * Get slug by color value.
     *
     * @param string $color - color value.
     *
     * @return string
     */
    public function get_slug_by_color( $color ) {
        if ( ! is_array( $this->color_palette ) ) {
            $this->color_palette = array();

            // Support for old themes palettes.
            $old_color_palette = get_theme_support( 'editor-color-palette' );
            if ( ! empty( $old_color_palette ) ) {
                $old_color_palette   = $old_color_palette[0];
                $this->color_palette = wp_list_pluck( $old_color_palette, 'slug', 'color' );
            }

            // Support for new FSE themes data.
            if ( method_exists( 'WP_Theme_JSON_Resolver', 'get_theme_data' ) ) {
                $theme_settings = WP_Theme_JSON_Resolver::get_theme_data()->get_settings();

                if ( isset( $theme_settings['color']['palette']['theme'] ) && ! empty( $theme_settings['color']['palette']['theme'] ) ) {
                    $this->color_palette = array_merge(
                        $this->color_palette,
                        wp_list_pluck( $theme_settings['color']['palette']['theme'], 'slug', 'color' )
                    );
                }
            }
        }

        if ( isset( $this->color_palette[ $color ] ) ) {
            return $this->color_palette[ $color ];
        }

        return '';
    }

    /**
     * Get color data by control value.
     *
     * @param string $value - attribute value.
     *
     * @return array
     */
    public function get_color_data_by_value( $value ) {
        $color_data = array(
            'color' => $value,
            'slug'  => $this->get_slug_by_color( $value ),
        );

        return $color_data;
    }

    /**
     * Get new attribute value.
     *
     * @param string $value - attribute value.
     * @param array  $control - control data.
     *
     * @return array
     */
    public function get_new_attribute_value( $value, $control ) {
        if ( 'array' === $control['output_format'] ) {
            $value = $this->get_color_data_by_value( $value );
        }

        return $value;
    }

    /**
     * Change block render attribute to custom output if needed.
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

        // prepare custom output.
        foreach ( $block['controls'] as $control ) {
            if (
                $this->name === $control['type'] &&
                isset( $attributes[ $control['name'] ] ) &&
                isset( $control['output_format'] ) &&
                $control['output_format']
            ) {
                $attributes[ $control['name'] ] = $this->get_new_attribute_value( $attributes[ $control['name'] ], $control );
            }
        }

        return $attributes;
    }

    /**
     * Change get_lzb_meta output to custom output if needed.
     *
     * @param array  $result - meta data.
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

        if (
            $this->name === $control['type'] &&
            isset( $result ) &&
            isset( $control['output_format'] ) &&
            $control['output_format']
        ) {
            $result = $this->get_new_attribute_value( $result, $control );
        }

        return $result;
    }
}

new LazyBlocks_Control_Color();
