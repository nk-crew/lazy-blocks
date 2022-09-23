<?php
/**
 * Rest API functions
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_Rest
 */
class LazyBlocks_Rest extends WP_REST_Controller {
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
    protected $version = '1';

    /**
     * LazyBlocks_Rest constructor.
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
            $namespace,
            '/block-render/',
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'get_block' ),
                'permission_callback' => array( $this, 'get_block_permission' ),
            )
        );

        // Get Lazy Block Editor Preview.
        register_rest_route(
            $namespace,
            '/block-render-code-preview/',
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'get_block' ),
                'permission_callback' => array( $this, 'get_block_permission' ),
            )
        );

        // Get Lazy Block Data.
        register_rest_route(
            $namespace,
            '/get-block-data/',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_block_data' ),
                'permission_callback' => array( $this, 'get_block_data_permission' ),
            )
        );

        // Update Lazy Block Data.
        register_rest_route(
            $namespace,
            '/update-block-data/',
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_block_data' ),
                'permission_callback' => array( $this, 'update_block_data_permission' ),
            )
        );

        // Get WP post types.
        register_rest_route(
            $namespace,
            '/get-post-types/',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_post_types' ),
                'permission_callback' => array( $this, 'get_post_types_permission' ),
            )
        );

        // Get Lazy Block Editor Preview.
        register_rest_route(
            $namespace,
            '/block-constructor-preview/',
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'block_constructor_preview' ),
                'permission_callback' => array( $this, 'block_constructor_preview_permission' ),
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
     *
     * @return WP_REST_Response|true
     */
    public function get_block_permission( $request ) {
        global $post;

        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;

        if ( 0 < $post_id ) {
            // phpcs:ignore
            $post = get_post( $post_id );

            if ( ! $post || ! current_user_can( 'edit_post', $post->ID ) ) {
                return $this->error( 'lazy_block_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks of this post.', 'lazy-blocks' ), true );
            }
        } elseif ( ! current_user_can( 'edit_posts' ) ) {
            return $this->error( 'lazy_block_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks as this user.', 'lazy-blocks' ), true );
        }

        return true;
    }

    /**
     * Get read block data permissions.
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|true
     */
    public function get_block_data_permission( $request ) {
        global $post;

        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;

        if ( 0 < $post_id ) {
            // phpcs:ignore
            $post = get_post( $post_id );
            if ( ! $post || ! current_user_can( 'edit_post', $post->ID ) ) {
                return $this->error( 'lazy_block_data_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks data.', 'lazy-blocks' ), true );
            }
        } elseif ( ! current_user_can( 'edit_posts' ) ) {
            return $this->error( 'lazy_block_data_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks data as this user.', 'lazy-blocks' ), true );
        }

        return true;
    }

    /**
     * Get edit block data permissions.
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|true
     */
    public function update_block_data_permission( $request ) {
        return $this->get_block_data_permission( $request );
    }

    /**
     * Get read wp post types permissions.
     *
     * @return WP_REST_Response|true
     */
    public function get_post_types_permission() {
        if ( ! current_user_can( 'edit_posts' ) ) {
            return $this->error( 'lazy_block_data_cannot_read', esc_html__( 'Sorry, you are not allowed to read Gutenberg blocks data as this user.', 'lazy-blocks' ), true );
        }

        return true;
    }

    /**
     * Get block constructor preview permissions.
     *
     * @param WP_REST_Request $request Request.
     *
     * @return WP_REST_Response|true
     */
    public function block_constructor_preview_permission( $request ) {
        return $this->get_block_data_permission( $request );
    }

    /**
     * Returns block output from block's registered render_callback.
     *
     * @since 2.8.0
     * @access public
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_block( $request ) {
        global $post;

        $post_id          = $request->get_param( 'post_id' ) ? intval( $request->get_param( 'post_id' ) ) : 0;
        $block_context    = $request->get_param( 'context' );
        $block_name       = $request->get_param( 'name' );
        $block_attributes = $request->get_param( 'attributes' );

        // add global data to fix meta data output in preview.
        global $lzb_preview_block_data;
        $lzb_preview_block_data = array(
            'post_id'          => $post_id,
            'block_context'    => $block_context,
            'block_name'       => $block_name,
            'block_attributes' => $block_attributes,
        );

        if ( 0 < $post_id ) {
            // phpcs:ignore
            $post = get_post( $post_id );

            // Set up postdata since this will be needed if post_id was set.
            setup_postdata( $post );
        }
        $block = lazyblocks()->blocks()->get_block( $block_name );

        if ( ! $block ) {
            return $this->error( 'lazy_block_invalid', esc_html__( 'Invalid block.', 'lazy-blocks' ) );
        }

        $block_result = lazyblocks()->blocks()->render_callback( $block_attributes, null, $block_context, $block );

        if ( isset( $block_result ) && null !== $block_result ) {
            return $this->success( $block_result );
        } else {
            return $this->error( 'lazy_block_no_render_callback', esc_html__( 'Render callback is not specified.', 'lazy-blocks' ) );
        }
    }

    /**
     * Update block data.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function update_block_data( $request ) {
        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;
        $data    = isset( $request['data'] ) ? $request['data'] : false;
        $meta    = array();

        if ( 0 < $post_id && $data ) {
            $meta_prefix = 'lazyblocks_';

            // add 'lazyblocks_' prefix.
            foreach ( $data as $k => $val ) {
                $meta[ $meta_prefix . $k ] = $val;
            }

            lazyblocks()->blocks()->save_meta_boxes( $post_id, $meta );
        }

        return $this->success( $meta );
    }

    /**
     * Get block data.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_block_data( $request ) {
        $post_id = isset( $request['post_id'] ) ? intval( $request['post_id'] ) : 0;
        $meta    = array();

        if ( 0 < $post_id ) {
            $post_meta   = lazyblocks()->blocks()->get_meta_boxes( $post_id );
            $meta_prefix = 'lazyblocks_';

            // remove 'lazyblocks_' prefix.
            foreach ( $post_meta as $k => $val ) {
                if ( substr( $k, 0, strlen( $meta_prefix ) ) === $meta_prefix ) {
                    $meta[ substr( $k, strlen( $meta_prefix ) ) ] = $val;
                }
            }
        }

        return $this->success( $meta );
    }

    /**
     * Get WP post types.
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function get_post_types( $request ) {
        $args     = isset( $request['args'] ) ? $request['args'] : array();
        $output   = isset( $request['output'] ) ? $request['output'] : 'names';
        $operator = isset( $request['operator'] ) ? $request['operator'] : 'and';

        $result = get_post_types( $args, $output, $operator );

        return $this->success( $result );
    }

    /**
     * Returns block output from block's registered custom_render.
     *
     * @access public
     *
     * @param WP_REST_Request $request Full details about the request.
     *
     * @return WP_REST_Response
     */
    public function block_constructor_preview( $request ) {
        $block      = $request->get_param( 'block' );
        $context    = $request->get_param( 'context' );
        $attributes = $request->get_param( 'attributes' );

        // Prepare block clean block data for marshal method.
        // Add 'lazyblocks_' prefix to all block attributes.
        $block_data = array();

        foreach ( $block as $k => $val ) {
            $block_data[ 'lazyblocks_' . $k ] = $val;
        }

        $block_data = lazyblocks()->blocks()->marshal_block_data( $block_data );

        // Prepare standard lazyblock attributes.
        $attributes['blockId']          = 'preview-id';
        $attributes['blockUniqueClass'] = 'lazyblock-preview-class';
        $attributes['anchor']           = '';
        $attributes['className']        = '';
        $attributes['align']            = '';
        $attributes['lazyblock']        = array(
            'slug' => $block_data['slug'],
        );

        try {
            $block_result = lazyblocks()->blocks()->render_callback( $attributes, null, $context, $block_data );
        } catch ( Throwable $e ) {
            return $this->error( 'lazy_block_render_failed', $e->getMessage() . PHP_EOL . PHP_EOL . $e->getTraceAsString() );
        }

        if ( isset( $block_result ) && null !== $block_result ) {
            return $this->success( $block_result );
        } else {
            return $this->error( 'lazy_block_no_render_callback', esc_html__( 'Render callback is not specified.', 'lazy-blocks' ) );
        }
    }

    /**
     * Success rest.
     *
     * @param mixed $response response data.
     *
     * @return WP_REST_Response
     */
    public function success( $response ) {
        return new WP_REST_Response(
            array(
                'success'  => true,
                'response' => $response,
            ),
            200
        );
    }

    /**
     * Error rest.
     *
     * @param mixed   $code       error code.
     * @param mixed   $response   response data.
     * @param boolean $true_error use true error response to stop the code processing.
     * @return mixed
     */
    public function error( $code, $response, $true_error = false ) {
        if ( $true_error ) {
            return new WP_Error( $code, $response, array( 'status' => 401 ) );
        }

        return new WP_REST_Response(
            array(
                'error'      => true,
                'success'    => false,
                'error_code' => $code,
                'message'    => $response,
            ),
            401
        );
    }
}
new LazyBlocks_Rest();
