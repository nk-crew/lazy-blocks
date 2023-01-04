<?php
/**
 * Select Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Select class.
 */
class LazyBlocks_Control_Select extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name       = 'select';
        $this->icon       = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M9 9H7V11H9V9Z" fill="currentColor"/><path d="M9 13H7V15H9V13Z" fill="currentColor"/><path d="M17 9H10V11H17V9Z" fill="currentColor"/><path d="M17 13H10V15H17V13Z" fill="currentColor"/></svg>';
        $this->type       = 'string';
        $this->label      = __( 'Select', 'lazy-blocks' );
        $this->category   = 'choice';
        $this->attributes = array(
            'choices'       => array(),
            'allow_null'    => 'false',
            'multiple'      => 'false',
            'output_format' => '',
        );

        // Filters.
        add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );
        add_filter( 'lzb/block_render/attributes', array( $this, 'filter_lzb_block_render_attributes' ), 10, 3 );
        add_filter( 'lzb/get_meta', array( $this, 'filter_get_lzb_meta_json' ), 10, 4 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-select',
            lazyblocks()->plugin_url() . 'dist/controls/select/script.min.js',
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
        return array( 'lazyblocks-control-select' );
    }

    /**
     * Filter block attribute.
     *
     * @param array $attribute_data - attribute data.
     * @param mixed $control - control data.
     *
     * @return array filtered attribute data.
     */
    public function filter_lzb_prepare_block_attribute( $attribute_data, $control ) {
        if (
            ! $control ||
            ! isset( $control['type'] ) ||
            $this->name !== $control['type'] ||
            ! isset( $control['multiple'] )
        ) {
            return $attribute_data;
        }

        if ( 'true' === $control['multiple'] ) {
            $attribute_data['type']    = 'array';
            $attribute_data['items']   = array( 'type' => 'string' );
            $attribute_data['default'] = explode( ',', $attribute_data['default'] );
        }

        return $attribute_data;
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
     * Get new attribute value.
     *
     * @param string $value - attribute value.
     * @param array  $control - control data.
     *
     * @return array
     */
    public function get_new_attribute_value( $value, $control ) {
        if ( isset( $control['multiple'] ) && 'true' === $control['multiple'] ) {
            if ( is_array( $value ) ) {
                foreach ( $value as $k => $item ) {
                    $choice_data = $this->get_choice_data_by_value( $value[ $k ], $control );

                    if ( 'label' === $control['output_format'] ) {
                        $value[ $k ] = $choice_data['label'];
                    } elseif ( 'array' === $control['output_format'] ) {
                        $value[ $k ] = $choice_data;
                    }
                }
            }
        } else {
            $choice_data = $this->get_choice_data_by_value( $value, $control );

            if ( 'label' === $control['output_format'] ) {
                $value = $choice_data['label'];
            } elseif ( 'array' === $control['output_format'] ) {
                $value = $choice_data;
            }
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

new LazyBlocks_Control_Select();
