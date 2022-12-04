<?php
/**
 * Deprecations.
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_Deprecations
 */
class LazyBlocks_Deprecations {
    /**
     * LazyBlocks_Deprecations constructor.
     */
    public function __construct() {
        // Filters for v2.5.0.
        add_filter( 'lzb/add_user_template', array( $this, 'v2_5_0_convert_user_template' ) );
        add_filter( 'lzb/import_json', array( $this, 'v2_5_0_convert_import_json_template' ) );

        // Filters for v2.1.0.
        add_filter( 'lzb/add_user_block', array( $this, 'v2_1_0_convert_user_block' ) );

        // Actions for v2.0.0.
        add_action( 'lzb/handlebars/object', array( $this, 'v2_0_0_deprecated_lzb_handlebars_object_action' ) );

        // Deprecated actions usage warning.
        add_action( 'init', array( $this, 'deprecated_actions_usage_warning' ) );
    }

    /**
     * Display deprecated error message for developers.
     *
     * @param string $msg - error message.
     */
    public function show_deprecated_error( $msg ) {
        // phpcs:ignore
        if ( WP_DEBUG ) {
            // phpcs:ignore
            trigger_error( esc_html( $msg ), E_USER_DEPRECATED );
        }
    }

    /**
     * Convert old template data to new when registering user template.
     *
     * @param array $data - template data.
     *
     * @return array
     */
    public function v2_5_0_convert_user_template( $data ) {
        if ( isset( $data['data'] ) ) {
            $data['post_types']    = array( $data['data']['post_type'] );
            $data['template_lock'] = $data['data']['template_lock'];
            $data['blocks']        = array();

            if ( isset( $data['data']['blocks'] ) ) {
                foreach ( $data['data']['blocks'] as $block ) {
                    $data['blocks'][] = array( $block['name'] );
                }
            }

            unset( $data['data'] );
        }

        return $data;
    }

    /**
     * Convert old template data to new when importing new template.
     *
     * @param array $json - json data.
     *
     * @return array
     */
    public function v2_5_0_convert_import_json_template( $json ) {
        // Loop over json.
        foreach ( $json as $k => $data ) {
            if ( isset( $data['id'] ) && ! isset( $data['controls'] ) && isset( $data['data'] ) ) {
                $json[ $k ] = $this->v2_5_0_convert_user_template( $data );
            }
        }

        return $json;
    }

    /**
     * Convert old block data to new when registering user block.
     *
     * @param array $data - block data.
     *
     * @return array
     */
    public function v2_1_0_convert_user_block( $data ) {
        // Fix deprecated 'use_php' and new 'output_method' code data.
        if ( isset( $data['code'] ) && ! isset( $data['code']['output_method'] ) ) {
            if ( isset( $data['code']['use_php'] ) && $data['code']['use_php'] ) {
                $data['code']['output_method'] = 'php';
            } else {
                $data['code']['output_method'] = 'html';
            }

            if ( isset( $data['code']['use_php'] ) ) {
                unset( $data['code']['use_php'] );
            }
        }

        return $data;
    }

    /**
     * Call deprecated handlebars action.
     *
     * @param Object $handlebars - handlebars data.
     */
    public function v2_0_0_deprecated_lzb_handlebars_object_action( $handlebars ) {
        do_action( 'lzb_handlebars_object', $handlebars );
    }

    /**
     * Warning usage of deprecated action.
     */
    public function deprecated_actions_usage_warning() {
        if ( has_action( 'lzb_handlebars_object' ) ) {
            $this->show_deprecated_error(
                sprintf(
                    /* translators: 1: WordPress hook name, 2: Version number, 3: Alternative hook name. */
                    esc_html__( 'Hook %1$s is <strong>deprecated</strong> since version %2$s! Use %3$s instead.', 'lazy-blocks' ),
                    'lzb_handlebars_object',
                    '3.1.0',
                    'lzb/handlebars/object'
                )
            );
        }
    }
}

new LazyBlocks_Deprecations();
