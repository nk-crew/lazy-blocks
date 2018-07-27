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
                <div class="lzb-templates-blocks">
                    <?php
                    $blocks = lazyblocks()->get_blocks();

                    // TODO: Add dynamic blocks list generating and not only for core blocks.
                    $core_blocks = array(
                        'core/paragraph' => 'Paragraph',
                        'core/image' => 'Image',
                        'core/heading' => 'Heading',
                        'core/gallery' => 'Gallery',
                        'core/list' => 'List',
                        'core/quote' => 'Quote',

                        'core/shortcode' => 'Shortcode',
                        'core/audio' => 'Audio',
                        'core/button' => 'Button',
                        'core/categories' => 'Categories',
                        'core/code' => 'Code',
                        'core/columns' => 'Columns',
                        'core/coverImage' => 'Cover Image',
                        'core/embed' => 'Embed',
                        'core/freeform' => 'Freeform',
                        'core/html' => 'HTML',
                        'core/latestPosts' => 'Latest Posts',
                        'core/more' => 'More',
                        'core/nextpage' => 'Next Page',
                        'core/preformatted' => 'Preformatted',
                        'core/pullquote' => 'Pullquote',
                        'core/separator' => 'Separator',
                        'core/spacer' => 'Spacer',
                        'core/subhead' => 'Subhead',
                        'core/table' => 'Table',
                        'core/textColumns' => 'Text Columns',
                        'core/verse' => 'Verse',
                        'core/video' => 'Video',
                    );

                    foreach ( $blocks as $block ) {
                        ?>
                        <div
                            data-block-id="<?php echo esc_attr( $block['id'] ); ?>"
                            data-block-name="<?php echo esc_attr( $block['slug'] ); ?>"
                            data-block-use-once="<?php echo esc_attr( $block['supports']['multiple'] ? 'false' : 'true' ); ?>"
                            data-block-title="<?php echo esc_attr( $block['title'] ); ?>"
                            data-block-icon="<?php echo esc_attr( $block['icon'] ); ?>"
                        ></div>
                        <?php
                    }

                    foreach ( $core_blocks as $slug => $block ) {
                        ?>
                        <div
                            data-block-id=""
                            data-block-name="<?php echo esc_attr( $slug ); ?>"
                            data-block-use-once="false"
                            data-block-title="<?php echo esc_attr( $block ); ?>"
                            data-block-icon=""
                        ></div>
                        <?php
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
}
