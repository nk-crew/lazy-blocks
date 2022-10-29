<?php
/**
 * LazyBlocks templates.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Templates class. Class to work with LazyBlocks CPT.
 */
class LazyBlocks_Templates {
    /**
     * LazyBlocks_Templates constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_post_type' ) );

        // add template to posts.
        add_filter( 'register_post_type_args', array( $this, 'register_post_type_args' ), 20, 2 );

        // enqueue Gutenberg on templates screen.
        add_action( 'enqueue_block_editor_assets', array( $this, 'templates_editor_enqueue_scripts' ) );

        // additional elements in blocks list table.
        add_filter( 'disable_months_dropdown', array( $this, 'disable_months_dropdown' ), 10, 2 );
        add_filter( 'post_row_actions', array( $this, 'post_row_actions' ), 10, 2 );
        add_filter( 'manage_lazyblocks_templates_posts_columns', array( $this, 'manage_posts_columns' ) );
        add_filter( 'manage_lazyblocks_templates_posts_custom_column', array( $this, 'manage_posts_custom_column' ), 10, 2 );
    }

    /**
     * Templates list.
     *
     * @var array|null
     */
    private $templates = null;

    /**
     * Templates list added by user using add_template method.
     *
     * @var null
     */
    private $user_templates = null;

    /**
     * Add template.
     *
     * @param array $data - block data.
     */
    public function add_template( $data ) {
        if ( null === $this->user_templates ) {
            $this->user_templates = array();
        }

        $this->user_templates[] = apply_filters( 'lzb/add_user_template', $data );
    }

    /**
     * Get all templates array.
     *
     * @param bool $db_only - get templates from database only.
     * @param bool $no_cache - get templates without cache.
     *
     * @return array|null
     */
    public function get_templates( $db_only = false, $no_cache = false ) {
        // fetch templates.
        if ( null === $this->templates || $no_cache ) {
            $this->templates = array();

            // get all lazyblocks_templates post types.
            // Don't use WP_Query on the admin side https://core.trac.wordpress.org/ticket/18408 .
            $all_templates = get_posts(
                array(
                    'post_type'      => 'lazyblocks_templates',
                    // phpcs:ignore
                    'posts_per_page' => -1,
                    'showposts'      => -1,
                    'paged'          => -1,
                )
            );

            foreach ( $all_templates as $template ) {
                $post_types    = get_post_meta( $template->ID, '_lzb_template_post_types', true );
                $template_lock = get_post_meta( $template->ID, '_lzb_template_lock', true );
                $blocks        = (array) json_decode( urldecode( get_post_meta( $template->ID, '_lzb_template_blocks', true ) ), true );

                $this->templates[] = array(
                    'id'            => $template->ID,
                    'title'         => $template->post_title,
                    'post_types'    => $post_types,
                    'template_lock' => $template_lock,
                    'blocks'        => $blocks,
                );
            }
        }

        if ( ! $db_only && $this->user_templates ) {
            return array_merge( $this->templates, $this->user_templates );
        }

        return $this->templates;
    }

    /**
     * Add templates to posts.
     *
     * @param array  $args - post type args.
     * @param string $post_type - post type.
     *
     * @return array
     */
    public function register_post_type_args( $args, $post_type ) {
        // get all templates.
        $all_templates = $this->get_templates();

        foreach ( $all_templates as $template ) {
            if ( ! in_array( $post_type, (array) $template['post_types'], true ) ) {
                continue;
            }

            if ( ! empty( $template['blocks'] ) ) {
                $args['template'] = $template['blocks'];

                if ( ! isset( $args['supports'] ) ) {
                    $args['supports'] = array();
                }
                if ( ! in_array( 'custom-fields', $args['supports'], true ) ) {
                    $args['supports'][] = 'custom-fields';
                }
            }

            if ( $template['template_lock'] ) {
                $args['template_lock'] = $template['template_lock'];
            }

            return $args;
        }

        return $args;
    }

    /**
     * Register CPT.
     */
    public function register_post_type() {
        register_post_type(
            'lazyblocks_templates',
            array(
                'labels'       => array(
                    'name'          => __( 'Templates', 'lazy-blocks' ),
                    'singular_name' => __( 'Template', 'lazy-blocks' ),
                ),
                'public'       => false,
                'has_archive'  => false,
                'show_ui'      => true,
                'show_in_menu' => 'edit.php?post_type=lazyblocks',
                'show_in_rest' => true,
                'capabilities' => array(
                    'edit_post'          => 'edit_lazyblock',
                    'edit_posts'         => 'edit_lazyblocks',
                    'edit_others_posts'  => 'edit_other_lazyblocks',
                    'publish_posts'      => 'publish_lazyblocks',
                    'read_post'          => 'read_lazyblock',
                    'read_private_posts' => 'read_private_lazyblocks',
                    'delete_posts'       => 'delete_lazyblocks',
                    'delete_post'        => 'delete_lazyblock',
                ),
                'rewrite'      => true,
                'supports'     => array(
                    'title',
                    'editor',
                    'revisions',
                    'custom-fields',
                ),
            )
        );

        // Actual template settings.
        register_meta(
            'post',
            '_lzb_template_lock',
            array(
                'object_subtype' => 'lazyblocks_templates',
                'type'           => 'string',
                'default'        => '',
                'single'         => true,
                'show_in_rest'   => true,
                'auth_callback'  => array( __CLASS__, 'rest_auth' ),
            )
        );
        register_meta(
            'post',
            '_lzb_template_post_types',
            array(
                'object_subtype' => 'lazyblocks_templates',
                'type'           => 'array',
                'single'         => true,
                'show_in_rest'   => array(
                    'schema' => array(
                        'type'  => 'array',
                        'items' => array(
                            'type' => 'string',
                        ),
                    ),
                ),
                'auth_callback'  => array( __CLASS__, 'rest_auth' ),
            )
        );
        register_meta(
            'post',
            '_lzb_template_blocks',
            array(
                'object_subtype' => 'lazyblocks_templates',
                'type'           => 'string',
                'default'        => '',
                'single'         => true,
                'show_in_rest'   => true,
                'auth_callback'  => array( __CLASS__, 'rest_auth' ),
            )
        );
        register_meta(
            'post',
            '_lzb_template_convert_blocks_to_content',
            array(
                'object_subtype' => 'lazyblocks_templates',
                'type'           => 'boolean',
                'default'        => false,
                'single'         => true,
                'show_in_rest'   => true,
                'auth_callback'  => array( __CLASS__, 'rest_auth' ),
            )
        );
    }

    /**
     * Determines REST API authentication.
     *
     * @param bool   $allowed Whether it is allowed.
     * @param string $meta_key The meta key being checked.
     * @param int    $post_id The post ID being checked.
     * @param int    $user_id The user ID being checked.
     *
     * @return bool Whether the user can do it.
     */
    public static function rest_auth( $allowed, $meta_key, $post_id, $user_id ) {
        return user_can( $user_id, 'edit_post', $post_id );
    }

    /**
     * Disable month dropdown.
     *
     * @param array  $return disabled dropdown or no.
     * @param object $post_type current post type name.
     *
     * @return array
     */
    public function disable_months_dropdown( $return, $post_type ) {
        return 'lazyblocks_templates' === $post_type ? true : $return;
    }

    /**
     * Remove unused actions from actions row.
     *
     * @param array  $actions actions for posts.
     * @param object $post current post data.
     *
     * @return array
     */
    public function post_row_actions( $actions = array(), $post = null ) {
        if ( ! $post || 'lazyblocks_templates' !== $post->post_type ) {
            return $actions;
        }

        // remove quick edit link.
        if ( isset( $actions['inline hide-if-no-js'] ) ) {
            unset( $actions['inline hide-if-no-js'] );
        }

        return $actions;
    }

    /**
     * Add additional columns to templates.
     *
     * @param array $columns columns of the table.
     *
     * @return array
     */
    public function manage_posts_columns( $columns = array() ) {
        $columns = array(
            'cb'                             => $columns['cb'],
            'title'                          => $columns['title'],
            'lazyblocks_template_post_types' => esc_html__( 'Post Types', 'lazy-blocks' ),
            'lazyblocks_template_lock'       => esc_html__( 'Template Lock', 'lazy-blocks' ),
        );

        return $columns;
    }

    /**
     * Add thumb to the column
     *
     * @param bool $column_name column name.
     */
    public function manage_posts_custom_column( $column_name = false ) {
        global $post;

        if ( 'lazyblocks_template_post_types' === $column_name ) {
            $post_types = get_post_meta( $post->ID, '_lzb_template_post_types', true );

            if ( ! empty( $post_types ) ) {
                foreach ( $post_types as $type ) {
                    $type_object = get_post_type_object( $type );

                    echo '<code>' . esc_html( isset( $type_object->labels->singular_name ) ? $type_object->labels->singular_name : $type ) . '</code> ';
                }
            } else {
                echo '-';
            }
        }
        if ( 'lazyblocks_template_lock' === $column_name ) {
            $template_lock = get_post_meta( $post->ID, '_lzb_template_lock', true );

            if ( 'all' === $template_lock ) {
                echo '<code>' . esc_html__( 'All', 'lazy-blocks' ) . '</code>';
            } elseif ( 'insert' === $template_lock ) {
                echo '<code>' . esc_html__( 'Insert', 'lazy-blocks' ) . '</code>';
            } else {
                echo '-';
            }
        }
    }

    /**
     * Enqueue constructor styles and scripts.
     */
    public function templates_editor_enqueue_scripts() {
        if ( 'lazyblocks_templates' === get_post_type() ) {
            $templates   = $this->get_templates( true );
            $post_types  = array();
            $template_id = get_the_ID();

            foreach ( $templates as $template ) {
                if ( $template['id'] !== $template_id ) {
                    $post_types = array_merge( (array) $template['post_types'], $post_types );
                }
            }

            wp_enqueue_script(
                'lazyblocks-templates',
                lazyblocks()->plugin_url() . 'dist/assets/admin/templates/index.min.js',
                array( 'wp-blocks', 'wp-block-library', 'wp-data', 'wp-element', 'wp-components', 'wp-api', 'wp-i18n' ),
                LAZY_BLOCKS_VERSION,
                true
            );
            wp_localize_script(
                'lazyblocks-templates',
                'lazyblocksTemplatesData',
                array(
                    'used_post_types_for_templates' => $post_types,
                )
            );

            wp_enqueue_style( 'lazyblocks-templates', lazyblocks()->plugin_url() . 'dist/assets/admin/templates/style.min.css', '', LAZY_BLOCKS_VERSION );
            wp_style_add_data( 'lazyblocks-templates', 'rtl', 'replace' );
            wp_style_add_data( 'lazyblocks-templates', 'suffix', '.min' );
        }
    }
}
