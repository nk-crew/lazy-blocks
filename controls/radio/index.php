<?php
/**
 * Radio Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Radio class.
 */
class LazyBlocks_Control_Radio extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'radio';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Radio', 'lazy-blocks' );
        $this->category   = 'choice';
        $this->attributes = array(
            'choices'       => array(),
            'allow_null'    => 'false',
            'multiple'      => 'false',
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
            'lazyblocks-control-radio',
            lazyblocks()->plugin_url() . 'dist/controls/radio/script.min.js',
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
        return array( 'lazyblocks-control-radio' );
    }

    /**
     * Get choice data by control value.
     *
     * @param string $value - attribute value.
     * @param array  $control - control data.
     *
     * @return array
     */
    public function get_choice_data_by_value( $value, $control ) {
        $choice_data = array(
            'value' => $value,
            'label' => $value,
        );

        if ( isset( $control['choices'] ) && is_array( $control['choices'] ) ) {
            foreach ( $control['choices'] as $choice ) {
                if ( $value === $choice['value'] ) {
                    $choice_data = $choice;
                }
            }
        }

        return $choice_data;
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
                $choice_data = $this->get_choice_data_by_value( $attributes[ $control['name'] ], $control );

                if ( 'label' === $control['output_format'] ) {
                    $attributes[ $control['name'] ] = $choice_data['label'];
                } elseif ( 'array' === $control['output_format'] ) {
                    $attributes[ $control['name'] ] = $choice_data;
                }
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
            $choice_data = $this->get_choice_data_by_value( $result, $control );

            if ( 'label' === $control['output_format'] ) {
                $result = $choice_data['label'];
            } elseif ( 'array' === $control['output_format'] ) {
                $result = $choice_data;
            }
        }

        return $result;
    }
}

new LazyBlocks_Control_Radio();
