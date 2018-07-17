<?php
/**
 * LazyBlocks blocks.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Blocks class. Class to work with LazyBlocks CPT.
 */
class LazyBlocks_Blocks {
    /**
     * LazyBlocks_Blocks constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_post_type' ) );

        // add general metaboxes.
        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 1 );
        add_action( 'save_post', array( $this, 'save_meta_boxes' ), 10, 2 );

        // add meta.
        add_action( 'init', array( $this, 'register_block_meta' ) );

        // add gutenberg blocks assets.
        if ( function_exists( 'register_block_type' ) ) {
            add_action( 'enqueue_block_editor_assets', array( $this, 'register_block' ) );
        }

        // admin blocks page enqueue.
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_blocks_enqueue_scripts' ), 9 );
    }

    /**
     * Register CPT.
     */
    public function register_post_type() {
        register_post_type(
            'lazyblocks',
            array(
                'labels' => array(
                    'name' => __( 'Lazy Blocks', '@@text_domain' ),
                    'singular_name' => __( 'Lazy Block', '@@text_domain' ),
                ),
                'public'       => false,
                'has_archive'  => false,
                'show_ui'      => true,

                // adding to custom menu manually.
                'show_in_menu' => false,
                'show_in_rest' => true,
                'capabilities' => array(
                    'edit_post' => 'edit_lazyblock',
                    'edit_posts' => 'edit_lazyblocks',
                    'edit_others_posts' => 'edit_other_lazyblocks',
                    'publish_posts' => 'publish_lazyblocks',
                    'read_post' => 'read_lazyblock',
                    'read_private_posts' => 'read_private_lazyblocks',
                    'delete_posts' => 'delete_lazyblocks',
                    'delete_post' => 'delete_lazyblock',
                ),
                'rewrite' => true,
                'supports' => array(
                    'title',
                    'revisions',
                ),
            )
        );
    }

    /**
     * Add post format metaboxes.
     */
    public function add_meta_boxes() {
        add_meta_box(
            'lazyblocks_controls',
            esc_html__( 'Controls', '@@text_domain' ),
            array( $this, 'add_controls_metabox' ),
            'lazyblocks',
            'normal',
            'default'
        );
        add_meta_box(
            'lazyblocks_code',
            esc_html__( 'Code', '@@text_domain' ),
            array( $this, 'add_code_metabox' ),
            'lazyblocks',
            'normal',
            'default'
        );
        add_meta_box(
            'lazyblocks_settings',
            esc_html__( 'Settings', '@@text_domain' ),
            array( $this, 'add_settings_metabox' ),
            'lazyblocks',
            'side',
            'default'
        );
        add_meta_box(
            'lazyblocks_condition',
            esc_html__( 'Condition', '@@text_domain' ),
            array( $this, 'add_condition_metabox' ),
            'lazyblocks',
            'side',
            'default'
        );
    }

    /**
     * Default values of controls.
     *
     * @var array
     */
    private $defaults = array(
        'lazyblocks_controls' => array(),

        'lazyblocks_slug'        => '',
        'lazyblocks_icon'        => '',
        'lazyblocks_description' => '',
        'lazyblocks_keywords'    => '',
        'lazyblocks_category'    => 'common',

        'lazyblocks_code_editor_html'   => '',
        'lazyblocks_code_editor_css'    => '',
        'lazyblocks_code_frontend_html' => '',
        'lazyblocks_code_frontend_css'  => '',

        'lazyblocks_supports_multiple'  => 'true',
        'lazyblocks_supports_classname' => 'true',
        'lazyblocks_supports_anchor'    => 'false',
        'lazyblocks_supports_html'      => 'false',
        'lazyblocks_supports_inserter'  => 'true',
        'lazyblocks_supports_align'     => array( 'wide', 'full' ),

        'lazyblocks_condition_post_types' => '',
    );

    /**
     * Get metabox value by name.
     *
     * @param string      $name - meta name.
     * @param int|boolean $id - post id.
     * @return mixed
     */
    private function get_meta_value( $name, $id = false ) {
        if ( ! $id ) {
            global $post;
            $id = $post->ID;
        }

        $result = get_post_meta( $id, $name, true );

        $default = null;
        if ( isset( $this->defaults[ $name ] ) ) {
            $default = $this->defaults[ $name ];
        }

        if ( '' === $result && null !== $default ) {
            $result = $default;
        }

        if ( 'true' === $result ) {
            $result = true;
        } else if ( 'false' === $result ) {
            $result = false;
        }

        return $result;
    }

    /**
     * Add Settings metabox
     */
    public function add_settings_metabox() {
        wp_nonce_field( basename( __FILE__ ), 'lazyblocks_metabox_nonce' );
        $slug = $this->get_meta_value( 'lazyblocks_slug' );
        $icon = $this->get_meta_value( 'lazyblocks_icon' );
        $description = $this->get_meta_value( 'lazyblocks_description' );
        $keywords = $this->get_meta_value( 'lazyblocks_keywords' );
        $category = $this->get_meta_value( 'lazyblocks_category' );

        $supports_multiple = $this->get_meta_value( 'lazyblocks_supports_multiple' );
        $supports_classname = $this->get_meta_value( 'lazyblocks_supports_classname' );
        $supports_align = (array) $this->get_meta_value( 'lazyblocks_supports_align' );
        $supports_anchor = $this->get_meta_value( 'lazyblocks_supports_anchor' );
        $supports_html = $this->get_meta_value( 'lazyblocks_supports_html' );
        $supports_inserter = $this->get_meta_value( 'lazyblocks_supports_inserter' );

        ?>

        <div class="lzb-metabox">
            <label for="lazyblocks_slug"><?php echo esc_html__( 'Slug', '@@text_domain' ); ?></label>
            <div class="lzb-input-slug">
                <span>lazyblock/</span>
                <input class="lzb-input" id="lazyblocks_slug" name="lazyblocks_slug" type="text" value="<?php echo esc_attr( $slug ); ?>">
            </div>
        </div>

        <div class="lzb-metabox">
            <label for="lazyblocks_icon"><?php echo esc_html__( 'Icon', '@@text_domain' ); ?></label>
            <div class="lzb-dashicons-picker">
                <input class="lzb-input" id="lazyblocks_icon" name="lazyblocks_icon" type="text" value="<?php echo esc_attr( $icon ); ?>">
                <button data-target="#lazyblocks_icon" class="button button-large dashicons-picker"><span class="lzb-dashicons-picker-preview"></span><?php echo esc_attr__( 'Choose', '@@text_domain' ); ?></button>
            </div>
        </div>

        <div class="lzb-metabox">
            <label for="lazyblocks_category"><?php echo esc_html__( 'Category', '@@text_domain' ); ?></label>
            <select class="lzb-select" name="lazyblocks_category" id="lazyblocks_category">
                <option value="common" <?php selected( $category, 'common' ); ?>><?php echo esc_html__( 'Common', '@@text_domain' ); ?></option>
                <option value="embed" <?php selected( $category, 'embed' ); ?>><?php echo esc_html__( 'Embed', '@@text_domain' ); ?></option>
                <option value="formatting" <?php selected( $category, 'formatting' ); ?>><?php echo esc_html__( 'Formatting', '@@text_domain' ); ?></option>
                <option value="layout" <?php selected( $category, 'layout' ); ?>><?php echo esc_html__( 'Layout', '@@text_domain' ); ?></option>
                <option value="widgets" <?php selected( $category, 'widgets' ); ?>><?php echo esc_html__( 'Widgets', '@@text_domain' ); ?></option>
            </select>
        </div>

        <div class="lzb-metabox">
            <label for="lazyblocks_description"><?php echo esc_html__( 'Description', '@@text_domain' ); ?></label>
            <textarea class="lzb-textarea" id="lazyblocks_description" name="lazyblocks_description"><?php echo esc_textarea( $description ); ?></textarea>
        </div>

        <div class="lzb-metabox">
            <label for="lazyblocks_keywords"><?php echo esc_html__( 'Keywords', '@@text_domain' ); ?></label>
            <input class="lzb-input" id="lazyblocks_keywords" name="lazyblocks_keywords" type="text" value="<?php echo esc_attr( $keywords ); ?>">
        </div>

        <div class="lzb-metabox">
            <label><?php echo esc_html__( 'Supports', '@@text_domain' ); ?></label>

            <label>
                <input type="hidden" name="lazyblocks_supports_multiple" id="lazyblocks_supports_multiple_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_multiple" id="lazyblocks_supports_multiple" value="true" <?php checked( $supports_multiple ); ?>>
                <?php echo esc_html__( 'Multiple', '@@text_domain' ); ?>
            </label>

            <label>
                <input type="hidden" name="lazyblocks_supports_classname" id="lazyblocks_supports_classname_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_classname" id="lazyblocks_supports_classname" value="true" <?php checked( $supports_classname ); ?>>
                <?php echo esc_html__( 'Class Name', '@@text_domain' ); ?>
            </label>

            <label>
                <input type="hidden" name="lazyblocks_supports_anchor" id="lazyblocks_supports_anchor_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_anchor" id="lazyblocks_supports_anchor" value="true" <?php checked( $supports_anchor ); ?>>
                <?php echo esc_html__( 'Anchor', '@@text_domain' ); ?>
            </label>

            <label>
                <input type="hidden" name="lazyblocks_supports_html" id="lazyblocks_supports_html_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_html" id="lazyblocks_supports_html" value="true" <?php checked( $supports_html ); ?>>
                <?php echo esc_html__( 'HTML', '@@text_domain' ); ?>
            </label>

            <label>
                <input type="hidden" name="lazyblocks_supports_inserter" id="lazyblocks_supports_inserter_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_inserter" id="lazyblocks_supports_inserter" value="true" <?php checked( $supports_inserter ); ?>>
                <?php echo esc_html__( 'Show in Blocks Inserter', '@@text_domain' ); ?>
            </label>

            <div class="lzb-metabox">
                <label for="lazyblocks_supports_align"><?php echo esc_html__( 'Align', '@@text_domain' ); ?></label>
                <select class="lzb-select" id="lazyblocks_supports_align" name="lazyblocks_supports_align[]" multiple>
                    <?php
                    foreach ( array( 'wide', 'full', 'left', 'center', 'right' ) as $align ) {
                        ?>
                        <option value="<?php echo esc_html( $align ); ?>" <?php echo selected( in_array( $align, $supports_align ) ); ?>><?php echo esc_html( $align ); ?></option>
                        <?php
                    }
                    ?>
                </select>
            </div>
        </div>
        <?php
    }

    /**
     * Add Controls metabox
     */
    public function add_controls_metabox() {
        ?>
        <div class="lzb-metabox-header">
            <div><?php echo esc_html__( 'Name', '@@text_domain' ); ?></div>
            <div><?php echo esc_html__( 'Type', '@@text_domain' ); ?></div>
            <div><?php echo esc_html__( 'Placement', '@@text_domain' ); ?></div>
            <div><?php echo esc_html__( 'Meta', '@@text_domain' ); ?></div>
        </div>
        <div class="lzb-metabox">
            <div class="lzb-metabox-loading">
                <?php
                // Controls will be added using JavaScript.
                echo esc_html__( 'Loading...', '@@text_domain' );
                ?>
            </div>
        </div>
        <?php
    }

    /**
     * Add Code metabox
     */
    public function add_code_metabox() {
        wp_enqueue_code_editor( array() );

        $editor_html = $this->get_meta_value( 'lazyblocks_code_editor_html' ) ? : '';
        $frontend_html = $this->get_meta_value( 'lazyblocks_code_frontend_html' ) ? : '';

        /*
            $editor_css = $this->get_meta_value( 'lazyblocks_code_editor_css' ) ? : '';
            $frontend_css = $this->get_meta_value( 'lazyblocks_code_frontend_css' ) ? : '';
         */

        ?>
        <div class="lzb-metabox-tabs">
            <div class="lzb-metabox-tabs-buttons">
                <a href="#" class="lzb-metabox-tabs-btn lzb-metabox-tabs-btn-active">
                    <?php echo esc_html__( 'Editor HTML', '@@text_domain' ); ?>
                </a>
                <a href="#" class="lzb-metabox-tabs-btn">
                    <?php echo esc_html__( 'Frontend HTML', '@@text_domain' ); ?>
                </a>
                <?php

                /*
                    <a href="#" class="lzb-metabox-tabs-btn">
                        <?php echo esc_html__( 'Editor CSS', '@@text_domain' ); ?>
                    </a>
                    <a href="#" class="lzb-metabox-tabs-btn">
                        <?php echo esc_html__( 'Frontend CSS', '@@text_domain' ); ?>
                    </a>.
                 */
                ?>
            </div>
            <div class="lzb-metabox-tabs-content">
                <div class="lzb-metabox-tabs-content-item lzb-metabox-tabs-content-item-active">
                    <div class="lzb-metabox">
                        <textarea class="lzb-textarea" id="lazyblocks_code_editor_html" name="lazyblocks_code_editor_html"><?php echo esc_textarea( $editor_html ); ?></textarea>
                    </div>
                </div>
                <div class="lzb-metabox-tabs-content-item">
                    <div class="lzb-metabox">
                        <textarea class="lzb-textarea" id="lazyblocks_code_frontend_html" name="lazyblocks_code_frontend_html"><?php echo esc_textarea( $frontend_html ); ?></textarea>
                    </div>
                </div>
                <?php

                /*
                    <div class="lzb-metabox-tabs-content-item">
                        <div class="lzb-metabox">
                            <textarea class="lzb-textarea" id="lazyblocks_code_editor_css" name="lazyblocks_code_editor_css"><?php echo esc_textarea( $editor_css ); ?></textarea>
                        </div>
                    </div>
                    <div class="lzb-metabox-tabs-content-item">
                        <div class="lzb-metabox">
                            <textarea class="lzb-textarea" id="lazyblocks_code_frontend_css" name="lazyblocks_code_frontend_css"><?php echo esc_textarea( $frontend_css ); ?></textarea>
                        </div>
                    </div>
                 */
                ?>
            </div>
        </div>
        <div class="lzb-metabox">
            <br>
            <p class="description">
                <?php echo esc_html__( 'Note 1: if you use blocks as Metaboxes, you may leave these code editors blank.', '@@text_domain' ); ?>
            </p>
            <p class="description">
                <?php echo wp_kses_post( __( 'Note 2: supported Handlebars syntax with your controls available by name. For example, if you have control with name <strong>my_control</strong>, you can print it <strong>{{controls.my_control}}</strong>.', '@@text_domain' ) ); ?>
            </p>
            <p class="description">
                <?php echo wp_kses_post( __( 'Note 3: yep, I know that Gutenberg based on React, but c\'mon... converting a string with JSX to React components is much more complicated than simple text replacements (Handlebars).', '@@text_domain' ) ); ?>
            </p>
        </div>
        <?php
    }

    /**
     * Add Condition metabox
     */
    public function add_condition_metabox() {
        $post_types = $this->get_meta_value( 'lazyblocks_condition_post_types' ) ? : array();
        $available_post_types = get_post_types( array(
            'show_ui' => true,
        ), 'object' );

        ?>
        <div class="lzb-metabox">
            <label for="lazyblocks_condition_post_types"><?php echo esc_html__( 'Show in posts', '@@text_domain' ); ?></label>
            <select class="lzb-select" id="lazyblocks_condition_post_types" name="lazyblocks_condition_post_types[]" multiple placeholder="<?php echo esc_attr__( 'In all posts by default', '@@text_domain' ); ?>">
                <?php
                foreach ( $available_post_types as $post ) {
                    if ( 'lazyblocks' !== $post->name && 'lazyblocks_templates' !== $post->name && 'attachment' !== $post->name ) {
                        ?>
                        <option value="<?php echo esc_html( $post->name ); ?>" <?php echo selected( in_array( $post->name, $post_types ) ); ?>><?php echo esc_html( $post->label ); ?></option>
                        <?php
                    }
                }
                ?>
            </select>
        </div>
        <?php
    }

    /**
     * Sanitize block slug name.
     * Keep only alpha and numbers.
     * Make it lowercase.
     *
     * @param string $slug - slug name.
     *
     * @return string
     */
    public function sanitize_slug( $slug ) {
        return strtolower( preg_replace( '/[^a-zA-Z0-9\-]+/', '', $slug ) );
    }

    /**
     * Recursive sanitation for an array
     * Thanks: https://wordpress.stackexchange.com/questions/24736/wordpress-sanitize-array/26465
     *
     * @param array $array - array for sanitize.
     *
     * @return array
     */
    private function sanitize_array( $array ) {
        foreach ( $array as $key => &$value ) {
            if ( is_array( $value ) ) {
                $value = $this->sanitize_array( $value );
            } else {
                if ( 'choices' === $key ) {
                    $value = sanitize_textarea_field( $value );
                } else {
                    $value = sanitize_text_field( $value );
                }
            }
        }

        return $array;
    }

    /**
     * Save Format metabox
     *
     * @param int    $post_id The post ID.
     * @param object $post The post object.
     */
    public function save_meta_boxes( $post_id, $post ) {
        if ( ! isset( $_POST['lazyblocks_metabox_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['lazyblocks_metabox_nonce'] ), basename( __FILE__ ) ) ) {
            return;
        }

        /* Get the post type object. */
        $post_type = get_post_type_object( $post->post_type );

        /* Check if the current user has permission to edit the post. */
        if ( ! current_user_can( $post_type->cap->edit_post, $post_id ) ) {
            return;
        }

        foreach ( $this->defaults as $meta => $default ) {
            $new_meta_value = '';

            if ( isset( $_POST[ $meta ] ) ) {
                // editors.
                if (
                    'lazyblocks_code_editor_html' === $meta ||
                    'lazyblocks_code_editor_css' === $meta ||
                    'lazyblocks_code_frontend_html' === $meta ||
                    'lazyblocks_code_frontend_css' === $meta
                ) {
                    $new_meta_value = wp_kses_post( wp_unslash( $_POST[ $meta ] ) );
                } else {
                    // Get the posted data and sanitize it for use as an HTML class.
                    $new_meta_value = sanitize_text_field( wp_unslash( $_POST[ $meta ] ) );

                    if ( 'Array' === $new_meta_value ) {
                        // phpcs:disable
                        $new_meta_value = $this->sanitize_array( wp_unslash( $_POST[ $meta ] ) );
                        // phpcs:enable
                    }
                }
            }

            // keep only alpha and numbers in slug.
            if ( 'lazyblock_slug' === $meta ) {
                $new_meta_value = $this->sanitize_slug( $new_meta_value );

                // generate slug from title.
                if ( ! $new_meta_value ) {
                    $new_meta_value = get_the_title();
                    $new_meta_value = $this->sanitize_slug( $new_meta_value );
                }

                // if no slug available.
                if ( ! $new_meta_value ) {
                    $new_meta_value = 'no-slug';
                }

                // generate unique slug.
                // $try_find_slug = 0;
                // $saved_username = $wp_username;
                // while ( ( username_exists( $wp_username ) ) && $try_find_slug++ < 5 ) {
                // $wp_username = $saved_username . '_' . mt_rand();
                // }.
            }

            /* Get the meta value of the custom field key. */
            $meta_value = get_post_meta( $post_id, $meta, true );

            /* If a new meta value was added and there was no previous value, add it. */
            if ( $new_meta_value && '' == $meta_value ) {
                add_post_meta( $post_id, $meta, $new_meta_value, true );

                /* If the new meta value does not match the old value, update it. */
            } elseif ( $new_meta_value && $new_meta_value != $meta_value ) {
                update_post_meta( $post_id, $meta, $new_meta_value );

                /* If there is no new meta value but an old value exists, delete it. */
            } elseif ( '' == $new_meta_value && $meta_value ) {
                delete_post_meta( $post_id, $meta, $meta_value );
            }
        }
    }

    /**
     * Blocks list.
     *
     * @var array|null
     */
    private $blocks = null;

    /**
     * Blocks list added by user using add_blocks method.
     *
     * @var null
     */
    private $user_blocks = null;

    /**
     * Add block.
     *
     * @param array $data - block data.
     */
    public function add_block( $data ) {
        if ( null === $this->user_blocks ) {
            $this->user_blocks = array();
        }
        $this->user_blocks[] = $data;
    }

    /**
     * Get all blocks array.
     *
     * @param bool $db_only - get blocks from database only.
     *
     * @return array|null
     */
    public function get_blocks( $db_only = false ) {
        // fetch blocks.
        if ( null === $this->blocks ) {
            $this->blocks = array();

            // get all lazyblocks post types.
            // Don't use WP_Query on the admin side https://core.trac.wordpress.org/ticket/18408 .
            $all_blocks = get_posts(
                array(
                    'post_type'      => 'lazyblocks',
                    // phpcs:ignore
                    'posts_per_page' => -1,
                    'showposts'      => -1,
                    'paged'          => -1,
                )
            );
            foreach ( $all_blocks as $block ) {
                $icon = esc_attr( $this->get_meta_value( 'lazyblocks_icon', $block->ID ) );
                $icon = str_replace( 'dashicons-', 'dashicons dashicons-', $icon );

                $keywords = esc_attr( $this->get_meta_value( 'lazyblocks_keywords', $block->ID ) );
                if ( $keywords ) {
                    $keywords = explode( ',', $keywords );
                } else {
                    $keywords = array();
                }
                $controls = $this->get_meta_value( 'lazyblocks_controls', $block->ID );

                $this->blocks[] = array(
                    'id'          => $block->ID,
                    'title'       => $block->post_title,
                    'icon'        => $icon,
                    'keywords'    => $keywords,
                    'slug'        => 'lazyblock/' . esc_html( $this->get_meta_value( 'lazyblocks_slug', $block->ID ) ),
                    'description' => esc_html( $this->get_meta_value( 'lazyblocks_description', $block->ID ) ),
                    'category'    => esc_html( $this->get_meta_value( 'lazyblocks_category', $block->ID ) ),
                    'supports'    => array(
                        'customClassName' => $this->get_meta_value( 'lazyblocks_supports_classname', $block->ID ),
                        'anchor'          => $this->get_meta_value( 'lazyblocks_supports_anchor', $block->ID ),
                        'align'           => (array) $this->get_meta_value( 'lazyblocks_supports_align', $block->ID ),
                        'html'            => $this->get_meta_value( 'lazyblocks_supports_html', $block->ID ),
                        'multiple'        => $this->get_meta_value( 'lazyblocks_supports_multiple', $block->ID ),
                        'inserter'        => $this->get_meta_value( 'lazyblocks_supports_inserter', $block->ID ),
                    ),
                    'controls'    => $controls,
                    'code'        => array(
                        'editor_html'   => $this->get_meta_value( 'lazyblocks_code_editor_html', $block->ID ),
                        'editor_css'    => $this->get_meta_value( 'lazyblocks_code_editor_css', $block->ID ),
                        'frontend_html' => $this->get_meta_value( 'lazyblocks_code_frontend_html', $block->ID ),
                        'frontend_css'  => $this->get_meta_value( 'lazyblocks_code_frontend_css', $block->ID ),
                    ),
                    'condition'   => $this->get_meta_value( 'lazyblocks_condition_post_types', $block->ID ) ? : array(),
                );
            }
        }

        $result = $this->blocks;

        if ( ! $db_only && $this->user_blocks ) {
            $result = array_merge( $result, $this->user_blocks );
        }

        // unique only.
        $unique_result = array();
        $slug_array = array();
        foreach ( $result as $item ) {
            if ( ! in_array( $item['slug'], $slug_array ) ) {
                $slug_array[] = $item['slug'];
                $unique_result[] = $item;
            }
        }

        return $unique_result;
    }

    /**
     * Register blocks meta if exists.
     */
    public function register_block_meta() {
        $blocks = $this->get_blocks();

        foreach ( $blocks as $block ) {
            $controls = $block['controls'];

            if ( isset( $controls ) && is_array( $controls ) && ! empty( $controls ) ) {
                foreach ( $controls as $control ) {
                    $type = 'string';

                    if ( isset( $control['type'] ) ) {
                        switch ( $control['type'] ) {
                            case 'number':
                                $type = 'number';
                                break;
                            case 'checkbox':
                            case 'toggle':
                                $type = 'boolean';
                                break;
                        }
                    }
                    if ( 'true' === $control['save_in_meta'] && $control['save_in_meta_name'] ) {
                        register_meta( 'post', $control['save_in_meta_name'], array(
                            'show_in_rest' => true,
                            'single'       => true,
                            'type'         => $type,
                        ) );
                    }
                }
            }
        }
    }

    /**
     * Add Gutenberg block assets.
     */
    public function register_block() {
        global $post_type;

        $blocks = $this->get_blocks();

        // enqueue block css.
        wp_enqueue_style(
            'lazyblocks-gutenberg',
            lazyblocks()->plugin_url . 'assets/css/style.min.css',
            array( 'wp-blocks' ),
            filemtime( lazyblocks()->plugin_path . 'assets/css/style.min.css' )
        );

        // enqueue block js.
        wp_enqueue_script(
            'lazyblocks-gutenberg',
            lazyblocks()->plugin_url . 'assets/js/index.min.js',
            array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'wp-components' ),
            filemtime( lazyblocks()->plugin_path . 'assets/js/index.min.js' )
        );

        // additional data for block js.
        wp_localize_script(
            'lazyblocks-gutenberg', 'lazyblocksGutenberg', array(
                'post_type' => $post_type,
                'blocks'    => $blocks,
            )
        );
    }

    /**
     * Add assets on admin blocks page.
     */
    public function admin_blocks_enqueue_scripts() {
        global $post_type;
        if ( 'lazyblocks' == $post_type ) {
            wp_enqueue_style( 'dashicons-picker', lazyblocks()->plugin_url . 'vendor/dashicons-picker/css/dashicons-picker.css', array( 'dashicons' ), '1.0', false );
            wp_enqueue_script( 'dashicons-picker', lazyblocks()->plugin_url . 'vendor/dashicons-picker/js/dashicons-picker.js', array( 'jquery' ), '1.1', true );

            wp_enqueue_style( 'selectize', lazyblocks()->plugin_url . 'vendor/selectize/css/selectize.css', array( 'dashicons' ), '0.12.4', false );
            wp_enqueue_script( 'selectize', lazyblocks()->plugin_url . 'vendor/selectize/js/standalone/selectize.min.js', array( 'jquery' ), '0.12.4', true );

            wp_enqueue_script( 'conditionize', lazyblocks()->plugin_url . 'vendor/conditionize/conditionize.js', array( 'jquery' ), '', true );

            wp_enqueue_script( 'sortablejs', lazyblocks()->plugin_url . 'vendor/sortablejs/Sortable.min.js', array( 'jquery' ), '', true );
        }
    }
}
