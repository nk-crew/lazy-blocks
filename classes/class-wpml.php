<?php
/**
 * WPML support.
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_WPML
 */
class LazyBlocks_WPML {
    /**
     * LazyBlocks_WPML constructor.
     */
    public function __construct() {
        add_filter( 'wpml_config_array', array( $this, 'wpml_config_array' ) );
    }

    /**
     * Convert controls to WPML data.
     *
     * @param Array  $controls - block controls.
     * @param String $child_of - filter by child key.
     *
     * @return Array
     */
    public function get_translated_controls_data( $controls, $child_of = '' ) {
        $translated_data = array();

        foreach ( $controls as $control_key => $control ) {
            if ( $child_of === $control['child_of'] ) {
                // Repeater control.
                if ( 'repeater' === $control['type'] ) {
                    $translate_inner_controls = $this->get_translated_controls_data( $controls, $control_key );

                    if ( ! empty( $translate_inner_controls ) ) {
                        $translated_data[] = array(
                            'value' => '',
                            'attr'  => array(
                                'name'     => $control['name'],
                                'encoding' => 'json',
                            ),
                            'key'   => array(
                                'value' => '',
                                'attr'  => array(
                                    'name' => '*',
                                ),
                                'key'   => $translate_inner_controls,
                            ),
                        );
                    }

                    // Regular control.
                } elseif ( isset( $control['translate'] ) && 'true' === $control['translate'] ) {
                    $translated_data[] = array(
                        'value' => '',
                        'attr'  => array(
                            'name' => $control['name'],
                        ),
                    );
                }
            }
        }

        return $translated_data;
    }

    /**
     * Prepare Lazy Blocks WPML configs for WMPL.
     *
     * @param Array $config - WPML config.
     *
     * @return Array
     */
    public function wpml_config_array( $config ) {
        if ( ! isset( $config['wpml-config']['gutenberg-blocks']['gutenberg-block'] ) ) {
            return $config;
        }

        $lazy_blocks = lazyblocks()->blocks()->get_blocks();

        foreach ( $lazy_blocks as $block ) {
            $translated_controls = array();

            if ( ! empty( $block['controls'] ) ) {
                $translated_controls = $this->get_translated_controls_data( $block['controls'] );
            }

            if ( ! empty( $translated_controls ) ) {
                $config['wpml-config']['gutenberg-blocks']['gutenberg-block'][] = array(
                    'value' => '',
                    'attr'  => array(
                        'type'      => $block['slug'],
                        'translate' => '1',
                    ),
                    'key'   => $translated_controls,
                );
            }
        }

        return $config;
    }
}

new LazyBlocks_WPML();
