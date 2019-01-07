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
        add_action( 'init', array( $this, 'add_template_to_posts' ) );

        // show blank state for portfolio list page.
        add_action( 'manage_posts_extra_tablenav', array( $this, 'change_admin_list_table' ) );

        // enqueue Gutenberg on templates screen.
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 9 );
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
     *
     * @return array|null
     */
    public function get_templates( $db_only = false ) {
        // fetch templates.
        if ( null === $this->templates ) {
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

            if ( ! empty( $data ) ) {
                $post_type_object = get_post_type_object( $data['post_type'] );
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
    }

    /**
     * Register CPT.
     */
    public function register_post_type() {
        register_post_type(
            'lazyblocks_templates',
            array(
                'labels' => array(
                    'name'          => __( 'Templates', '@@text_domain' ),
                    'singular_name' => __( 'Template', '@@text_domain' ),
                ),
                'public'       => false,
                'has_archive'  => false,
                'show_ui'      => true,

                // adding to custom menu manually.
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
                'rewrite' => true,
                'supports' => array(
                    'title',
                    'revisions',
                    'custom-fields',
                ),
            )
        );

        register_meta( 'post', 'lzb_template_data', array(
            'object_subtype' => 'lazyblocks_templates',
            'show_in_rest'   => true,
            'single'         => true,
            'type'           => 'string',
        ) );
    }

    /**
     * Change default WP admin list table.
     *
     * @param string $which position.
     */
    public function change_admin_list_table( $which ) {
        global $posts;
        global $post_type;

        if ( in_array( $post_type, array( 'lazyblocks_templates' ) ) && 'top' === $which ) {
            $available_post_types = get_post_types( array(
                'show_ui' => true,
            ), 'object' );

            $added_post_types = array();
            if ( ! empty( $posts ) ) {
                foreach ( $posts as $post ) {
                    $meta = (array) json_decode( get_post_meta( $post->ID, 'lzb_template_data', true ) );

                    if ( isset( $meta['post_type'] ) ) {
                        $added_post_types[] = $meta['post_type'];
                    }
                }
            }

            if ( ! empty( $available_post_types ) ) :
            ?>
                <div class="lzb-templates-label">
                    <?php echo esc_html__( 'Select post type:', '@@text_domain' ); ?>
                </div>
                <div class="lzb-templates-buttons">
                    <?php
                    foreach ( $available_post_types as $post ) {
                        if ( 'lazyblocks' !== $post->name && 'lazyblocks_templates' !== $post->name && 'attachment' !== $post->name ) {
                            $label = $post->label;

                            if ( isset( $post->labels ) && isset( $post->labels->singular_name ) ) {
                                $label = $post->labels->singular_name;
                            }
                            ?>
                            <button class="button button-secondary" data-post-type="<?php echo esc_html( $post->name ); ?>" data-post-label="<?php echo esc_attr( $label ); ?>" <?php echo esc_html( in_array( $post->name, $added_post_types ) ? 'disabled="disabled"' : '' ); ?>><?php echo esc_html( $label ); ?></button>
                            <?php
                        }
                    }
                    ?>
                </div>
                <div class="lzb-templates-list">
                    <?php
                    if ( ! empty( $posts ) ) {
                        foreach ( $posts as $post ) {
                            ?>
                            <div class="lzb-templates-list-item">
                                <div class="lzb-templates-single">
                                    <div class="lzb-metabox">
                                        <div class="lzb-metabox-label">
                                            <label><?php echo esc_html( $post->post_title ); ?></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <?php
                        }
                    }
                    ?>
                </div>
            <?php
            endif;
            ?>
            <style type="text/css">
                .lzb-templates-blocks,
                #posts-filter .wp-list-table,
                #posts-filter .tablenav.bottom,
                #posts-filter .search-box,
                .tablenav.top > .actions,
                .tablenav .tablenav-pages,
                .wrap .subsubsub,
                .wp-heading-inline + .page-title-action {
                    display: none;
                }
            </style>
            <?php
        }
    }

    /**
     * Enqueue Gutenberg scripts to work with registered blocks on Templates page.
     */
    public function admin_enqueue_scripts() {
        global $post_type;

        if ( 'lazyblocks_templates' !== $post_type ) {
            return;
        }

        $block_categories = array();
        if ( function_exists( 'get_block_categories' ) ) {
            $block_categories = get_block_categories( get_post() );
        } else if ( function_exists( 'gutenberg_get_block_categories' ) ) {
            $block_categories = gutenberg_get_block_categories( get_post() );
        }

        wp_add_inline_script(
            'wp-blocks',
            sprintf( 'wp.blocks.setCategories( %s );', wp_json_encode( $block_categories ) ),
            'after'
        );

        do_action( 'enqueue_block_editor_assets' );

        // enqueue blocks library.
        wp_enqueue_script( 'wp-block-library' );
    }
}
