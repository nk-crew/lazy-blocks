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
        $this->type       = 'string';
        $this->label      = __( 'Select', '@@text_domain' );
        $this->category   = __( 'Choice', '@@text_domain' );
        $this->attributes = array(
            'choices'    => [],
            'allow_null' => 'false',
            'multiple'   => 'false',
        );

        // Filters.
        add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

        parent::__construct();
    }

    /**
     * Register assets action.
     */
    public function register_assets() {
        wp_register_script(
            'lazyblocks-control-select',
            lazyblocks()->plugin_url . 'controls/select/script.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components' ),
            '@@plugin_version'
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
     * @param string $attribute_data - attribute data.
     * @param mixed  $control - control data.
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
}

new LazyBlocks_Control_Select();
