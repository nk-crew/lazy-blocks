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
        add_action( 'admin_menu', array( $this, 'admin_menu' ) );

        add_action( 'init', array( $this, 'register_post_type' ) );

        // add template to posts.
        add_action( 'init', array( $this, 'add_template_to_posts' ), 100 );

        // enqueue Gutenberg on templates screen.
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );

        // redirect from admin list page.
        add_action( 'admin_init', array( $this, 'admin_list_redirect' ) );
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
        $this->user_templates[] = $data;
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
                $data = (array) json_decode( urldecode( get_post_meta( $template->ID, 'lzb_template_data', true ) ), true );

                $this->templates[] = array(
                    'id'    => $template->ID,
                    'title' => $template->post_title,
                    'data'  => $data,
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
     */
    public function add_template_to_posts() {
        // get all templates.
        $all_templates = $this->get_templates();

        foreach ( $all_templates as $template ) {
            $data = $template['data'];

            if ( empty( $data ) ) {
                continue;
            }

            $post_type_object = get_post_type_object( $data['post_type'] );

            if ( ! $post_type_object ) {
                continue;
            }

            $blocks = array();

            foreach ( (array) $data['blocks'] as $block ) {
                $blocks[] = array(
                    $block['name'],
                    array(
                        // default data.
                    ),
                );
            }

            if ( ! empty( $blocks ) ) {
                $post_type_object->template = $blocks;
                add_post_type_support( $data['post_type'], 'custom-fields' );
            }

            if ( isset( $data['template_lock'] ) && $data['template_lock'] ) {
                $post_type_object->template_lock = $data['template_lock'];
            }
        }
    }

    /**
     * Admin menu.
     */
    public function admin_menu() {
        add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'Templates', '@@text_domain' ),
            esc_html__( 'Templates', '@@text_domain' ),
            'manage_options',
            'lazyblocks_templates',
            array( $this, 'render_templates_page' )
        );
    }

    /**
     * Register CPT.
     */
    public function register_post_type() {
        register_post_type(
            'lazyblocks_templates',
            array(
                'labels'       => array(
                    'name'          => __( 'Templates', '@@text_domain' ),
                    'singular_name' => __( 'Template', '@@text_domain' ),
                ),
                'public'       => false,
                'has_archive'  => false,
                'show_ui'      => true,

                // adding to custom menu manually.
                'show_in_menu' => false,
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
                    'revisions',
                    'custom-fields',
                ),
            )
        );

        register_meta(
            'post',
            'lzb_template_data',
            array(
                'object_subtype' => 'lazyblocks_templates',
                'show_in_rest'   => true,
                'single'         => true,
                'type'           => 'string',
            )
        );
    }

    /**
     * Templates page
     */
    public function render_templates_page() {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php echo esc_html__( 'Templates', '@@text_domain' ); ?></h1>

            <div id="poststuff">
                <div class="lazyblocks-templates-page">
                    <span class="spinner is-active"></span>
                </div>
            </div>
        </div>
        <style type="text/css">
            .lazyblocks-templates-page > .spinner {
                float: left;
                margin-left: 0;
            }
        </style>
        <?php
    }

    /**
     * Redirect from templates list page.
     */
    public function admin_list_redirect() {
        // phpcs:ignore
        if ( ! isset( $_GET['post_type'] ) || empty( $_GET['post_type'] ) ) {
            return;
        }

        // phpcs:ignore
        if ( 'lazyblocks_templates' === $_GET['post_type'] ) {
            wp_safe_redirect( 'edit.php?post_type=lazyblocks&page=lazyblocks_templates' );
            exit();
        }
    }

    /**
     * Enqueue Gutenberg scripts to work with registered blocks on Templates page.
     *
     * @param string $page_data Current page name.
     */
    public function admin_enqueue_scripts( $page_data ) {
        if ( 'lazyblocks_page_lazyblocks_templates' !== $page_data ) {
            return;
        }

        $block_categories = array();
        if ( function_exists( 'get_block_categories' ) ) {
            $block_categories = get_block_categories( get_post() );
        } elseif ( function_exists( 'gutenberg_get_block_categories' ) ) {
            /** @phpstan-ignore-next-line */
            $block_categories = gutenberg_get_block_categories( get_post() );
        }

        wp_add_inline_script(
            'wp-blocks',
            sprintf( 'wp.blocks.setCategories( %s );', wp_json_encode( $block_categories ) ),
            'after'
        );

        // phpcs:ignore
        do_action( 'enqueue_block_editor_assets' );

        // Lazyblocks Templates.
        wp_enqueue_script(
            'lazyblocks-templates',
            lazyblocks()->plugin_url() . 'assets/admin/templates/index.min.js',
            array( 'wp-blocks', 'wp-block-library', 'wp-data', 'wp-element', 'wp-components', 'wp-api', 'wp-i18n' ),
            '@@plugin_version',
            true
        );
    }
}
