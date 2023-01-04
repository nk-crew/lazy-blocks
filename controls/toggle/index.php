<?php
/**
 * Toggle Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Control_Toggle class.
 */
class LazyBlocks_Control_Toggle extends LazyBlocks_Control {
    /**
     * Constructor
     */
    public function __construct() {
        $this->name         = 'toggle';
        $this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="12" r="3" fill="currentColor"/><rect x="1.75" y="6.75" width="20.5" height="10.5" rx="5.25" stroke="currentColor" stroke-width="1.5"/></svg>';
        $this->type         = 'boolean';
        $this->label        = __( 'Toggle', 'lazy-blocks' );
        $this->category     = 'choice';
        $this->restrictions = array(
            'default_settings' => false,
        );
        $this->attributes   = array(
            'checked'        => 'false',
            'alongside_text' => '',
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
            'lazyblocks-control-toggle',
            lazyblocks()->plugin_url() . 'dist/controls/toggle/script.min.js',
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
        return array( 'lazyblocks-control-toggle' );
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
            ! isset( $control['checked'] )
        ) {
            return $attribute_data;
        }

        if ( ! isset( $attribute_data['default'] ) || ! is_bool( $attribute_data['default'] ) ) {
            $attribute_data['default'] = 'true' === $control['checked'];
        }

        return $attribute_data;
    }
}

new LazyBlocks_Control_Toggle();
