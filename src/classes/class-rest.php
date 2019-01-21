<?php
/**
 * Rest API functions
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Lazy_Blocks_Rest
 */
class Lazy_Blocks_Rest extends WP_REST_Controller {
    /**
     * Namespace.
     *
     * @var string
     */
    protected $namespace = 'lazy-blocks/v';

    /**
     * Version.
     *
     * @var string
     */
    protected $version   = '1';

    /**
     * Lazy_Blocks_Rest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register rest routes.
     */
    public function register_routes() {
        $namespace = $this->namespace . $this->version;

        // Get Lazy Block Editor Preview.
        register_rest_route(
            $namespace, '/block-render/', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_block' ),
                'permission_callback' => array( $this, 'get_block_permission' ),
            )
        );
    }

    /**
     * Checks if a given request has access to read blocks.
     *
     * @since 2.8.0
     * @access public
     *
     * @param WP_REST_Request $request Request.
     * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
     */
    public function get_block_permission( $request ) {
        global $post;

        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;

        if ( 0 < $post_id ) {
            // phpcs:ignore
            $post = get_post( $post_id );
            if ( ! $post || ! current_user_can( 'edit_post', $post->ID ) ) {
                return $this->error( 'lazy_block_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks of this post.', '@@text_domain' ) );
            }
        } else {
            if ( ! current_user_can( 'edit_posts' ) ) {
                return $this->error( 'lazy_block_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks as this user.', '@@text_domain' ) );
            }
        }

        return true;
    }

    /**
     * Returns block output from block's registered render_callback.
     *
     * @since 2.8.0
     * @access public
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_block( $request ) {
        global $post;

        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;
        $block_context = $request->get_param( 'context' );
        $block_name = $request->get_param( 'name' );
        $block_attributes = $request->get_param( 'attributes' );

        if ( 0 < $post_id ) {
            // phpcs:ignore
            $post = get_post( $post_id );

            // Set up postdata since this will be needed if post_id was set.
            setup_postdata( $post );
        }
        $block = lazyblocks()->blocks()->get_block( $block_name );

        if ( ! $block ) {
            return $this->error( 'lazy_block_invalid', esc_html__( 'Invalid block.', '@@text_domain' ) );
        }

        $block_result = lazyblocks()->blocks()->render_callback( $block_attributes, null, $block_context );

        if ( isset( $block_result ) && $block_result ) {
            return $this->success( $block_result );
        } else {
            return $this->error( 'lazy_block_no_render_callback', esc_html__( 'Render callback is not specified.', '@@text_domain' ) );
        }
    }

    /**
     * Success rest.
     *
     * @param mixed $response response data.
     * @return mixed
     */
    public function success( $response ) {
        return new WP_REST_Response(
            array(
                'success' => true,
                'response' => $response,
            ), 200
        );
    }

    /**
     * Error rest.
     *
     * @param mixed $code     error code.
     * @param mixed $response response data.
     * @return mixed
     */
    public function error( $code, $response ) {
        return new WP_REST_Response(
            array(
                'error' => true,
                'success' => false,
                'error_code' => $code,
                'response' => $response,
            ), 200
        );
    }
}
new Lazy_Blocks_Rest();
