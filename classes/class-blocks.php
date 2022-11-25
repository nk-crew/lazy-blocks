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
     * Handlebars engine.
     *
     * @var null|object
     */
    private $handlebars = null;

    /**
     * Rules to sanitize SVG
     *
     * @var array
     */
    private $kses_svg = array(
        'svg'   => array(
            'class'           => true,
            'aria-hidden'     => true,
            'aria-labelledby' => true,
            'role'            => true,
            'xmlns'           => true,
            'width'           => true,
            'height'          => true,
            'viewbox'         => true,   // <= Must be lower case!
        ),
        'g'     => array( 'fill' => true ),
        'title' => array( 'title' => true ),
        'path'  => array(
            'd'    => true,
            'fill' => true,
        ),
        'rect'  => array(
            'fill'      => true,
            'opacity'   => true,
            'width'     => true,
            'height'    => true,
            'rx'        => true,
            'transform' => true,
        ),
    );

    /**
     * LazyBlocks_Blocks constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'prepare_handlebars' ) );

        add_action( 'init', array( $this, 'register_post_type' ) );

        add_action( 'init', array( $this, 'remove_custom_fields_support' ), 150 );

        // It is important to have priority higher than 10 to prevent possible conflicts.
        // https://github.com/nk-crew/lazy-blocks/issues/247 .
        add_filter( 'allowed_block_types_all', array( $this, 'allowed_block_types_all' ), 100, 2 );

        // custom post roles.
        add_action( 'admin_init', array( $this, 'add_role_caps' ) );

        // additional elements in blocks list table.
        add_filter( 'disable_months_dropdown', array( $this, 'disable_months_dropdown' ), 10, 2 );
        add_filter( 'post_row_actions', array( $this, 'post_row_actions' ), 10, 2 );
        add_filter( 'bulk_actions-edit-lazyblocks', array( $this, 'bulk_actions_edit' ) );
        add_filter( 'handle_bulk_actions-edit-lazyblocks', array( $this, 'handle_bulk_actions_edit' ), 10, 3 );
        add_filter( 'manage_lazyblocks_posts_columns', array( $this, 'manage_posts_columns' ) );
        add_filter( 'manage_lazyblocks_posts_custom_column', array( $this, 'manage_posts_custom_column' ), 10, 2 );

        // sanitize block configs.
        add_filter( 'lzb/get_blocks', array( $this, 'sanitize_block_configs' ), 100 );

        // add gutenberg blocks assets.
        if ( function_exists( 'register_block_type' ) ) {
            // add custom block categories.
            add_filter( 'block_categories_all', array( $this, 'block_categories_all' ), 100 );

            // It is important to have priority higher than 10 to allow users register
            // custom blocks using standard `init` hook.
            add_action( 'init', array( $this, 'register_block' ), 20 );
            add_action( 'init', array( $this, 'register_block_render' ), 20 );
        }
    }

    /**
     * Handlebars php.
     */
    public function prepare_handlebars() {
        require_once lazyblocks()->plugin_path() . 'vendors/Handlebars/Autoloader.php';

        Handlebars\Autoloader::register();

        $this->handlebars = new Handlebars\Handlebars();

        // phpcs:ignore
        // truncate
        // {{truncate 'string' 2 'true'}}.
        $this->handlebars->registerHelper(
            'truncate',
            function( $str, $len, $ellipsis = 'true' ) {
                if ( $str && $len && mb_strlen( $str, 'UTF-8' ) > $len ) {
                    $new_str = mb_substr( $str, 0, $len + 1, 'UTF-8' );
                    $count   = mb_strlen( $new_str, 'UTF-8' );

                    while ( $count > 0 ) {
                        $ch      = mb_substr( $new_str, -1, null, 'UTF-8' );
                        $new_str = mb_substr( $new_str, 0, -1, 'UTF-8' );

                        $count--;

                        if ( ' ' === $ch ) {
                            break;
                        }
                    }

                    if ( '' === $new_str ) {
                        $new_str = mb_substr( $str, 0, $len, 'UTF-8' );
                    }

                    return new \Handlebars\SafeString( $new_str . ( 'true' === $ellipsis ? '...' : '' ) );
                }
                return $str;
            }
        );

        // compare.
        // {{#compare 1 '===' 2}} Show if true {{/compare}}
        // slightly changed https://gist.github.com/doginthehat/1890659.
        $this->handlebars->registerHelper(
            'compare',
            function( $lvalue, $operator, $rvalue = null, $options = null ) {
                if ( null === $rvalue ) {
                    return $options['inverse']();
                }

                if ( null === $options ) {
                    $options  = $rvalue;
                    $rvalue   = $operator;
                    $operator = '===';
                }

                $result = false;

                switch ( $operator ) {
                    case '==':
                        // phpcs:ignore
                        $result = $lvalue == $rvalue;
                        break;
                    case '===':
                        $result = $lvalue === $rvalue;
                        break;
                    case '!=':
                        // phpcs:ignore
                        $result = $lvalue != $rvalue;
                        break;
                    case '!==':
                        $result = $lvalue !== $rvalue;
                        break;
                    case '<':
                        $result = $lvalue < $rvalue;
                        break;
                    case '>':
                        $result = $lvalue > $rvalue;
                        break;
                    case '<=':
                        $result = $lvalue <= $rvalue;
                        break;
                    case '>=':
                        $result = $lvalue >= $rvalue;
                        break;
                    case '&&':
                        $result = $lvalue && $rvalue;
                        break;
                    case '||':
                        $result = $lvalue || $rvalue;
                        break;
                    case 'typeof':
                        $result = gettype( $lvalue ) === $rvalue;
                        break;
                }

                if ( $result ) {
                    return $options['fn']();
                }

                return $options['inverse']();
            }
        );

        // math.
        // {{math 1 '+' 2}}
        // https://stackoverflow.com/questions/33059203/error-missing-helper-in-handlebars-js/46317662#46317662.
        $this->handlebars->registerHelper(
            'math',
            function( $lvalue, $operator, $rvalue ) {
                $result = '';

                switch ( $operator ) {
                    case '+':
                        $result = $lvalue + $rvalue;
                        break;
                    case '-':
                        $result = $lvalue - $rvalue;
                        break;
                    case '*':
                        $result = $lvalue * $rvalue;
                        break;
                    case '/':
                        $result = $lvalue / $rvalue;
                        break;
                    case '%':
                        $result = $lvalue % $rvalue;
                        break;
                }

                return $result;
            }
        );

        // phpcs:ignore
        // do_shortcode.
        // {{{do_shortcode 'my_shortcode' this}}}.
        $this->handlebars->registerHelper(
            'do_shortcode',
            function( $shortcode_name, $attributes ) {
                $result = '[' . $shortcode_name;

                // prepare attributes.
                if ( isset( $attributes ) && ! empty( $attributes ) ) {
                    foreach ( $attributes as $name => $val ) {
                        if (
                        'content' === $name
                        || 'lazyblock_code_frontend_html' === $name
                        || 'lazyblock_code_backend_html' === $name
                        || 'data' === $name
                        || 'hash' === $name
                        ) {
                            continue;
                        }

                        if ( is_array( $val ) ) {
                            $val = wp_json_encode( $val );
                        }

                        if (
                        ! is_numeric( $val )
                        && ! is_string( $val )
                        && ! is_bool( $val )
                        ) {
                            continue;
                        }

                        if ( is_bool( $val ) ) {
                            $val = $val ? '1' : '0';
                        }

                        $result .= ' ' . esc_attr( $name ) . '="' . esc_attr( $val ) . '"';
                    }

                    // content.
                    if ( isset( $attributes['content'] ) ) {
                        $result .= ']' . $attributes['content'] . '[/' . $shortcode_name;
                    }
                }

                $result .= ']';

                return do_shortcode( $result );
            }
        );

        // phpcs:ignore
        // date_i18n.
        // {{date_i18n 'F j, Y H:i' '2018-09-16 15:35'}}.
        $this->handlebars->registerHelper(
            'date_i18n',
            function( $format, $time ) {
                return date_i18n( $format, strtotime( $time ) );
            }
        );

        // phpcs:ignore
        // var_dump.
        // {{var_dump 'test'}}.
        $this->handlebars->registerHelper(
            'var_dump',
            function( $val ) {
                ob_start();
                // phpcs:ignore
                var_dump( $val );
                return ob_get_clean();
            }
        );

        // custom action for extending default helpers by 3rd-party.
        do_action( 'lzb/handlebars/object', $this->handlebars );
    }

    /**
     * Register CPT.
     */
    public function register_post_type() {
        register_post_type(
            'lazyblocks',
            array(
                'labels'            => array(
                    'menu_name'     => __( 'Lazy Blocks', 'lazy-blocks' ),
                    'name'          => __( 'Blocks', 'lazy-blocks' ),
                    'all_items'     => __( 'Blocks', 'lazy-blocks' ),
                    'singular_name' => __( 'Block', 'lazy-blocks' ),
                ),
                'public'            => false,
                'has_archive'       => false,
                'show_ui'           => true,

                // adding to custom menu manually.
                'show_in_menu'      => true,
                'show_in_admin_bar' => true,
                'show_in_rest'      => true,
                // phpcs:ignore
                'menu_icon'         => 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( lazyblocks()->plugin_path() . 'assets/svg/icon-lazyblocks.svg' ) ),
                'menu_position'     => 80,
                'capabilities'      => array(
                    'edit_post'          => 'edit_lazyblock',
                    'edit_posts'         => 'edit_lazyblocks',
                    'edit_others_posts'  => 'edit_other_lazyblocks',
                    'publish_posts'      => 'publish_lazyblocks',
                    'read_post'          => 'read_lazyblock',
                    'read_private_posts' => 'read_private_lazyblocks',
                    'delete_posts'       => 'delete_lazyblocks',
                    'delete_post'        => 'delete_lazyblock',
                ),
                'rewrite'           => true,
                'supports'          => array(
                    'title',
                    'editor',
                    'revisions',
                ),
                'template'          => array(
                    array(
                        'lzb-constructor/main',
                    ),
                ),
                // we can't use it since blocks didn't inserted in some posts.
                // 'template_lock' => 'all',.
            )
        );
    }

    /**
     * Remove custom fields support from lazy blocks constructor page.
     * Some plugins adds support for custom fields to all post types, but we don't need it in our constructor.
     *
     * @link https://github.com/nk-crew/lazy-blocks/issues/141
     */
    public function remove_custom_fields_support() {
        remove_post_type_support( 'lazyblocks', 'custom-fields' );
    }

    /**
     * Allowed blocks for lazyblocks post type.
     *
     * @param array  $allowed_block_types - blocks.
     * @param object $editor_context - editor context.
     * @return array
     */
    public function allowed_block_types_all( $allowed_block_types, $editor_context ) {
        if ( empty( $editor_context->post ) || 'lazyblocks' !== $editor_context->post->post_type ) {
            return $allowed_block_types;
        }
        return array( 'lzb-constructor/main' );
    }

    /**
     * Add Roles
     */
    public function add_role_caps() {
        global $wp_roles;

        if ( isset( $wp_roles ) ) {
            $wp_roles->add_cap( 'administrator', 'edit_lazyblock' );
            $wp_roles->add_cap( 'administrator', 'edit_lazyblocks' );
            $wp_roles->add_cap( 'administrator', 'edit_other_lazyblocks' );
            $wp_roles->add_cap( 'administrator', 'publish_lazyblocks' );
            $wp_roles->add_cap( 'administrator', 'read_lazyblock' );
            $wp_roles->add_cap( 'administrator', 'read_private_lazyblocks' );
            $wp_roles->add_cap( 'administrator', 'delete_lazyblocks' );
            $wp_roles->add_cap( 'administrator', 'delete_lazyblock' );

            $wp_roles->add_cap( 'editor', 'read_lazyblock' );
            $wp_roles->add_cap( 'editor', 'read_private_lazyblocks' );

            $wp_roles->add_cap( 'author', 'read_lazyblock' );
            $wp_roles->add_cap( 'author', 'read_private_lazyblocks' );

            $wp_roles->add_cap( 'contributor', 'read_lazyblock' );
            $wp_roles->add_cap( 'contributor', 'read_private_lazyblocks' );
        }
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
        return 'lazyblocks' === $post_type ? true : $return;
    }

    /**
     * Add featured image in lazyblocks list
     *
     * @param array  $actions actions for posts.
     * @param object $post current post data.
     *
     * @return array
     */
    public function post_row_actions( $actions = array(), $post = null ) {
        if ( ! $post || 'lazyblocks' !== $post->post_type ) {
            return $actions;
        }

        // remove quick edit link.
        if ( isset( $actions['inline hide-if-no-js'] ) ) {
            unset( $actions['inline hide-if-no-js'] );
        }

        // add duplicate and export link.
        $actions = array_merge(
            array_slice( $actions, 0, 1 ),
            array(
                'duplicate' => sprintf(
                    '<a href="%1$s" aria-label="%2$s">%3$s</a>',
                    add_query_arg(
                        array(
                            'lazyblocks_duplicate_block' => $post->ID,
                            'lazyblocks_duplicate_block_nonce' => wp_create_nonce( 'lzb-duplicate-block-nonce' ),
                        )
                    ),
                    sprintf(
                        // translators: %1$ - post title.
                        esc_html__( 'Duplicate “%1$s”', 'lazy-blocks' ),
                        get_the_title( $post->ID )
                    ),
                    esc_html__( 'Duplicate', 'lazy-blocks' )
                ),
                'export' => sprintf(
                    '<a href="%1$s" aria-label="%2$s">%3$s</a>',
                    add_query_arg(
                        array(
                            'lazyblocks_export_block' => $post->ID,
                        )
                    ),
                    sprintf(
                        // translators: %1$ - post title.
                        esc_html__( 'Export “%1$s”', 'lazy-blocks' ),
                        get_the_title( $post->ID )
                    ),
                    esc_html__( 'Export', 'lazy-blocks' )
                ),
            ),
            array_slice( $actions, 1 )
        );

        return $actions;
    }

    /**
     * Bulk actions.
     *
     * @param array $actions bulk actions for posts.
     *
     * @return array
     */
    public function bulk_actions_edit( $actions = array() ) {
        unset( $actions['edit'] );

        $actions['export'] = esc_html__( 'Export', 'lazy-blocks' );

        return $actions;
    }

    /**
     * Prepare to bulk export blocks.
     *
     * @param string $redirect redirect url after export.
     * @param string $action action name.
     * @param array  $post_ids post ids to export.
     *
     * @return string
     */
    public function handle_bulk_actions_edit( $redirect, $action, $post_ids ) {
        if ( 'export' !== $action ) {
            return $redirect;
        }

        lazyblocks()->tools()->export_json( $post_ids, 'blocks' );

        return $redirect;
    }

    /**
     * Add featured image in lazyblocks list
     *
     * @param array $columns columns of the table.
     *
     * @return array
     */
    public function manage_posts_columns( $columns = array() ) {
        $columns = array(
            'cb'                          => $columns['cb'],
            'lazyblocks_post_icon'        => esc_html__( 'Icon', 'lazy-blocks' ),
            'title'                       => $columns['title'],
            'lazyblocks_post_category'    => esc_html__( 'Category', 'lazy-blocks' ),
            'lazyblocks_post_description' => esc_html__( 'Description', 'lazy-blocks' ),
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

        if ( 'lazyblocks_post_icon' === $column_name ) {
            $icon      = $this->get_meta_value_by_id( 'lazyblocks_icon' );
            $admin_url = get_edit_post_link( $post->ID );

            echo '<a class="lzb-admin-block-icon" href="' . esc_url( $admin_url ) . '">';

            if ( $icon && strpos( $icon, 'dashicons' ) === 0 ) {
                echo '<span class="dashicons ' . esc_attr( $icon ) . '"></span>';
            } elseif ( $icon ) {
                echo wp_kses( $icon, $this->kses_svg );
            }

            echo '</a>';
        }

        if ( 'lazyblocks_post_category' === $column_name ) {
            $category = $this->get_meta_value_by_id( 'lazyblocks_category' );
            if ( $category ) {
                $gutenberg_categories = array();
                if ( function_exists( 'get_block_categories' ) ) {
                    $gutenberg_categories = get_block_categories( $post );
                } elseif ( function_exists( 'gutenberg_get_block_categories' ) ) {
                    $gutenberg_categories = gutenberg_get_block_categories( $post );
                }

                foreach ( $gutenberg_categories as $cat ) {
                    if ( $cat['slug'] === $category ) {
                        $category = $cat['title'];
                        break;
                    }
                }

                echo esc_html( $category );
            }
        }

        if ( 'lazyblocks_post_description' === $column_name ) {
            $description = $this->get_meta_value_by_id( 'lazyblocks_description' );
            echo wp_kses_post( $description );
        }
    }

    /**
     * Default block data.
     *
     * @var array
     */
    private $block_defaults = array(
        'lazyblocks_controls'                        => array(),

        'lazyblocks_slug'                            => '',
        'lazyblocks_icon'                            => '',
        'lazyblocks_description'                     => '',
        'lazyblocks_keywords'                        => '',
        'lazyblocks_category'                        => 'text',

        'lazyblocks_code_show_preview'               => 'always',
        'lazyblocks_code_single_output'              => 'false',
        'lazyblocks_code_output_method'              => 'html',

        'lazyblocks_code_editor_html'                => '',
        'lazyblocks_code_editor_callback'            => '',
        'lazyblocks_code_editor_css'                 => '',
        'lazyblocks_code_frontend_html'              => '',
        'lazyblocks_code_frontend_callback'          => '',
        'lazyblocks_code_frontend_css'               => '',

        'lazyblocks_supports_multiple'               => 'true',
        'lazyblocks_supports_classname'              => 'true',
        'lazyblocks_supports_anchor'                 => 'false',
        'lazyblocks_supports_html'                   => 'false',
        'lazyblocks_supports_inserter'               => 'true',
        'lazyblocks_supports_align'                  => array( 'wide', 'full' ),

        // Ghost Kit Extensions.
        'lazyblocks_supports_ghostkit_spacings'      => 'false',
        'lazyblocks_supports_ghostkit_display'       => 'false',
        'lazyblocks_supports_ghostkit_scroll_reveal' => 'false',
        'lazyblocks_supports_ghostkit_frame'         => 'false',
        'lazyblocks_supports_ghostkit_custom_css'    => 'false',

        'lazyblocks_condition_post_types'            => '',
    );

    /**
     * Return default constructor block data.
     *
     * @return array
     */
    private function get_block_defaults() {
        return apply_filters( 'lzb/block_defaults', $this->block_defaults );
    }

    /**
     * Get metabox value by name.
     *
     * @param string $name - meta name.
     * @param mixed  $result - result of stored attribute.
     *
     * @return mixed
     */
    private function get_meta_value( $name, $result ) {
        $defaults = $this->get_block_defaults();
        $default  = null;

        if ( isset( $defaults[ $name ] ) ) {
            $default = $defaults[ $name ];
        }

        if ( '' === $result && null !== $default ) {
            $result = $default;
        }

        if ( 'true' === $result ) {
            $result = true;
        } elseif ( 'false' === $result ) {
            $result = false;
        }

        return $result;
    }

    /**
     * Get metabox value by name and post id.
     *
     * @param string      $name - meta name.
     * @param int|boolean $id - post id.
     * @return mixed
     */
    private function get_meta_value_by_id( $name, $id = false ) {
        if ( ! $id ) {
            global $post;
            $id = $post->ID;
        }

        $result = get_post_meta( $id, $name, true );

        return $this->get_meta_value( $name, $result );
    }

    /**
     * Get metabox value by name and block data.
     *
     * @param string $name - meta name.
     * @param array  $block_data - supplied block data.
     *
     * @return mixed
     */
    private function get_meta_value_by_block( $name, $block_data ) {
        $result = $block_data[ $name ];

        return $this->get_meta_value( $name, $result );
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
     * Returns true if the current user is allowed to save unfiltered HTML.
     *
     * @return bool
     */
    public function is_allowed_unfiltered_html() {
        $allow_unfiltered_html = current_user_can( 'unfiltered_html' );

        return apply_filters( 'lzb/allow_unfiltered_html', $allow_unfiltered_html );
    }

    /**
     * Save Format metabox
     *
     * @param int   $post_id The post ID.
     * @param array $data Metaboxes data for save.
     */
    public function save_meta_boxes( $post_id, $data ) {
        $defaults = $this->get_block_defaults();

        foreach ( $defaults as $meta => $default ) {
            $new_meta_value = '';

            if ( isset( $data[ $meta ] ) ) {
                // convert boolean to string.
                if ( is_bool( $data[ $meta ] ) ) {
                    $data[ $meta ] = $data[ $meta ] ? 'true' : 'false';
                }

                // icon and editors.
                if (
                    'lazyblocks_icon' === $meta ||
                    'lazyblocks_code_editor_html' === $meta ||
                    'lazyblocks_code_editor_css' === $meta ||
                    'lazyblocks_code_frontend_html' === $meta ||
                    'lazyblocks_code_frontend_css' === $meta
                ) {
                    $new_meta_value = wp_slash( $data[ $meta ] );
                } else {
                    $new_meta_value = wp_slash( $data[ $meta ] );

                    // Filter $_POST data for users without the 'unfiltered_html' capability.
                    if ( ! $this->is_allowed_unfiltered_html() ) {
                        $new_meta_value = wp_kses_post_deep( $new_meta_value );
                    }
                }
            }

            // keep only alpha and numbers in slug.
            if ( 'lazyblocks_slug' === $meta ) {
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
            }

            /* Get the meta value of the custom field key. */
            $meta_value = get_post_meta( $post_id, $meta, true );

            $meta_value_to_check     = $meta_value;
            $new_meta_value_to_check = $new_meta_value;

            if ( is_array( $meta_value_to_check ) ) {
                $meta_value_to_check = wp_json_encode( $meta_value_to_check );
            }
            if ( is_array( $new_meta_value_to_check ) ) {
                $new_meta_value_to_check = wp_json_encode( $new_meta_value_to_check );
            }

            /* If a new meta value was added and there was no previous value, add it. */
            if ( $new_meta_value_to_check && '' === $meta_value_to_check ) {
                add_post_meta( $post_id, $meta, $new_meta_value, true );

                /* If the new meta value does not match the old value, update it. */
            } elseif ( $new_meta_value_to_check && $new_meta_value_to_check !== $meta_value_to_check ) {
                update_post_meta( $post_id, $meta, $new_meta_value );

                /* If there is no new meta value but an old value exists, delete it. */
            } elseif ( '' === $new_meta_value_to_check && $meta_value_to_check ) {
                delete_post_meta( $post_id, $meta, $meta_value );
            }
        }
    }

    /**
     * Get metabox data
     *
     * @param int $post_id The post ID.
     *
     * @return array|null
     */
    public function get_meta_boxes( $post_id ) {
        $defaults    = $this->get_block_defaults();
        $result_meta = array();

        foreach ( $defaults as $meta => $default ) {
            $result_meta[ $meta ] = $this->get_meta_value_by_id( $meta, $post_id );
        }

        return $result_meta;
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

        $this->user_blocks[] = apply_filters( 'lzb/add_user_block', $data );
    }

    /**
     * Prepare block controls by adding defaults.
     *
     * @param array $controls - block controls.
     * @param array $all_controls - all registered controls.
     *
     * @return array
     */
    public function prepare_block_controls( $controls, $all_controls ) {
        $result = array();

        foreach ( (array) $controls as $k => $control ) {
            if ( isset( $control['type'] ) && isset( $all_controls[ $control['type'] ] ) && isset( $all_controls[ $control['type'] ]['attributes'] ) ) {
                $result[ $k ] = array_merge(
                    $all_controls[ $control['type'] ]['attributes'],
                    $control
                );
            }
        }

        return $result;
    }

    /**
     * Convert block format.
     *
     * @param array $block_data - block data.
     */
    public function marshal_block_data( $block_data ) {
        $all_controls = lazyblocks()->controls()->get_controls();
        return $this->marshal_block_data_with_controls( null, null, $block_data, $all_controls );
    }

    /**
     * Convert block format.
     *
     * @param int   $id - registered block id.
     * @param int   $post_title - registered block post title.
     * @param array $block_data - block data.
     * @param array $all_controls - control data.
     */
    public function marshal_block_data_with_controls( $id = null, $post_title = null, $block_data = null, $all_controls = null ) {
        $get_meta_value = function( $name ) use ( $id, $block_data ) {
            if ( $id ) {
                return $this->get_meta_value_by_id( $name, $id );
            } else {
                return $this->get_meta_value_by_block( $name, $block_data );
            }
        };

        $icon = $get_meta_value( 'lazyblocks_icon' );

        // add default icon.
        if ( ! $icon ) {
            // phpcs:ignore
            $icon = file_get_contents( lazyblocks()->plugin_path() . 'assets/svg/icon-lazyblocks.svg' );
            $icon = str_replace( 'fill="white"', 'fill="currentColor"', $icon );
        }

        if ( $icon && strpos( $icon, 'dashicons' ) === 0 ) {
            $icon = esc_attr( str_replace( 'dashicons-', 'dashicons dashicons-', $icon ) );
        } elseif ( $icon ) {
            $icon = wp_kses( $icon, $this->kses_svg );
        }

        $keywords = esc_attr( $get_meta_value( 'lazyblocks_keywords' ) );
        if ( $keywords ) {
            $keywords = explode( ',', $keywords );
        } else {
            $keywords = array();
        }

        // prepare default control data.
        $controls = $this->prepare_block_controls( $get_meta_value( 'lazyblocks_controls' ), $all_controls );

        $align          = (array) $get_meta_value( 'lazyblocks_supports_align' );
        $align_none_key = array_search( 'none', $align, true );

        if ( false !== $align_none_key ) {
            unset( $align[ $align_none_key ] );
        }

        return apply_filters(
            'lzb/block_data',
            array(
                'id'             => $id,
                'title'          => $post_title,
                'icon'           => $icon,
                'keywords'       => $keywords,
                'slug'           => 'lazyblock/' . esc_html( $get_meta_value( 'lazyblocks_slug' ) ),
                'description'    => $get_meta_value( 'lazyblocks_description' ),
                'category'       => $this->sanitize_slug( esc_html( $get_meta_value( 'lazyblocks_category' ) ) ),
                'category_label' => esc_html( $get_meta_value( 'lazyblocks_category' ) ),
                'supports'       => array(
                    'customClassName' => $get_meta_value( 'lazyblocks_supports_classname' ),
                    'anchor'          => $get_meta_value( 'lazyblocks_supports_anchor' ),
                    'align'           => $align,
                    'html'            => $get_meta_value( 'lazyblocks_supports_html' ),
                    'multiple'        => $get_meta_value( 'lazyblocks_supports_multiple' ),
                    'inserter'        => $get_meta_value( 'lazyblocks_supports_inserter' ),
                ),
                'ghostkit'       => array(
                    'supports' => array(
                        'spacings'     => $get_meta_value( 'lazyblocks_supports_ghostkit_spacings' ),
                        'display'      => $get_meta_value( 'lazyblocks_supports_ghostkit_display' ),
                        'scrollReveal' => $get_meta_value( 'lazyblocks_supports_ghostkit_scroll_reveal' ),
                        'frame'        => $get_meta_value( 'lazyblocks_supports_ghostkit_frame' ),
                        'customCSS'    => $get_meta_value( 'lazyblocks_supports_ghostkit_custom_css' ),
                    ),
                ),
                'controls'       => $controls,
                'code'           => array(
                    'output_method'     => $get_meta_value( 'lazyblocks_code_output_method' ),
                    'editor_html'       => $get_meta_value( 'lazyblocks_code_editor_html' ),
                    'editor_callback'   => '',
                    'editor_css'        => $get_meta_value( 'lazyblocks_code_editor_css' ),
                    'frontend_html'     => $get_meta_value( 'lazyblocks_code_frontend_html' ),
                    'frontend_callback' => '',
                    'frontend_css'      => $get_meta_value( 'lazyblocks_code_frontend_css' ),
                    'show_preview'      => $get_meta_value( 'lazyblocks_code_show_preview' ),
                    'single_output'     => $get_meta_value( 'lazyblocks_code_single_output' ),
                ),
                'condition'      => $get_meta_value( 'lazyblocks_condition_post_types' ) ? $get_meta_value( 'lazyblocks_condition_post_types' ) : array(),
                'edit_url'       => get_edit_post_link( $id ),
            ),
            $get_meta_value
        );
    }

    /**
     * Get all blocks array.
     *
     * @param bool $db_only - get blocks from database only.
     * @param bool $no_cache - get blocks without cache.
     * @param bool $keep_duplicates - get blocks with same slugs.
     *
     * @return array|null
     */
    public function get_blocks( $db_only = false, $no_cache = false, $keep_duplicates = false ) {
        // fetch blocks.
        if ( null === $this->blocks || $no_cache ) {
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

            $all_controls = lazyblocks()->controls()->get_controls();

            foreach ( $all_blocks as $block ) {
                $this->blocks[] = $this->marshal_block_data_with_controls( $block->ID, $block->post_title, null, $all_controls );
            }
        }

        $result = $this->blocks;

        if ( ! $db_only && $this->user_blocks ) {
            $all_user_blocks = $this->user_blocks;
            $all_controls    = lazyblocks()->controls()->get_controls();

            foreach ( $all_user_blocks as $block ) {
                $block['controls'] = $this->prepare_block_controls( $block['controls'], $all_controls );

                $result[] = $block;
            }
        }

        // unique only.
        if ( ! $keep_duplicates ) {
            $unique_result = array();
            $slug_array    = array();

            foreach ( $result as $item ) {
                if ( ! in_array( $item['slug'], $slug_array, true ) ) {
                    $slug_array[]    = $item['slug'];
                    $unique_result[] = $item;
                }
            }

            return apply_filters( 'lzb/get_blocks', $unique_result );
        }

        return apply_filters( 'lzb/get_blocks', $result );
    }

    /**
     * Get specific block data by name.
     *
     * @param string $name - block name.
     * @param bool   $db_only - get blocks from database only.
     *
     * @return array|null
     */
    public function get_block( $name, $db_only = false ) {
        $blocks = $this->get_blocks( $db_only );

        foreach ( $blocks as $block ) {
            if ( $name === $block['slug'] ) {
                return $block;
            }
        }

        return false;
    }

    /**
     * Get all custom blocks categories array.
     *
     * @param bool $db_only - get blocks from database only.
     *
     * @return array|null
     */
    public function get_blocks_categories( $db_only = false ) {
        $blocks             = $this->get_blocks( $db_only );
        $default_categories = array(
            'text',
            'media',
            'design',
            'widgets',
            'embed',
            'reusable',
        );

        $custom_categories = array();

        foreach ( $blocks as $block ) {
            if (
                ! isset( $default_categories[ $block['category'] ] ) &&
                ! isset( $custom_categories[ $block['category'] ] ) &&
                ! in_array( $block['category'], $default_categories, true ) &&
                isset( $block['category_label'] )
            ) {
                $custom_categories[ $block['category'] ] = $block['category_label'];
            }
        }

        return $custom_categories;
    }

    /**
     * Sanitize block configs.
     *
     * @param array $blocks - block list.
     *
     * @return array
     */
    public function sanitize_block_configs( $blocks ) {
        if ( empty( $blocks ) ) {
            return $blocks;
        }

        $sanitize_block_data = apply_filters(
            'lzb/sanitize_block_data',
            array(
                'title',
                'description',
                'category',
                'category_label',
            )
        );

        $sanitize_control_data = apply_filters(
            'lzb/sanitize_block_control_data',
            array(
                'label',
                'help',
                'rows_label',
                'rows_add_button_label',
                'placeholder',
            )
        );

        foreach ( $blocks as &$block ) {
            foreach ( $sanitize_block_data as $name ) {
                if ( ! empty( $block[ $name ] ) ) {
                    $block[ $name ] = wp_kses_post( $block[ $name ] );
                }
            }

            if ( ! empty( $block['controls'] ) ) {
                foreach ( $block['controls'] as &$control_data ) {
                    foreach ( $sanitize_control_data as $name ) {
                        if ( ! empty( $control_data[ $name ] ) ) {
                            $control_data[ $name ] = wp_kses_post( $control_data[ $name ] );
                        }
                    }
                }
            }
        }

        return $blocks;
    }

    /**
     * Register custom categories for blocks
     *
     * @param array $categories - available categories.
     * @return array
     */
    public function block_categories_all( $categories ) {
        // lazyblocks core category.
        $categories[] = array(
            'slug'  => 'lazyblocks',
            'title' => esc_html__( 'Lazy Blocks', 'lazy-blocks' ),
        );

        $new_categories = $this->get_blocks_categories();
        if ( ! empty( $new_categories ) ) {
            foreach ( $new_categories as $slug => $category ) {
                // no duplicates.
                $allow = true;

                foreach ( $categories as $existing_cat ) {
                    if ( isset( $existing_cat['slug'] ) && $slug === $existing_cat['slug'] ) {
                        $allow = false;
                    }
                }

                if ( $allow ) {
                    $categories[] = array(
                        'slug'  => $slug,
                        'title' => $category,
                    );
                }
            }
        }

        return $categories;
    }

    /**
     * Add Gutenberg block assets.
     */
    public function register_block() {
        $blocks = $this->get_blocks();

        wp_register_style( 'lazyblocks-editor', lazyblocks()->plugin_url() . 'dist/assets/editor/style.min.css', array(), LAZY_BLOCKS_VERSION );
        wp_style_add_data( 'lazyblocks-editor', 'rtl', 'replace' );
        wp_style_add_data( 'lazyblocks-editor', 'suffix', '.min' );

        // enqueue block js.
        wp_register_script(
            'lazyblocks-editor',
            lazyblocks()->plugin_url() . 'dist/assets/editor/index.min.js',
            array( 'wp-blocks', 'wp-block-editor', 'wp-i18n', 'wp-element', 'wp-components' ),
            LAZY_BLOCKS_VERSION,
            true
        );

        // additional data for block js.
        wp_localize_script(
            'lazyblocks-editor',
            'lazyblocksGutenberg',
            array(
                'blocks'             => $blocks,
                'controls'           => lazyblocks()->controls()->get_controls(),
                'icons'              => lazyblocks()->icons()->get_all(),
                'allowed_mime_types' => get_allowed_mime_types(),
            )
        );
    }

    /**
     * Prepare attributes.
     * The same function placed in block JSX file.
     *
     * @param array          $controls - controls list.
     * @param string|boolean $child_of - childOf control name.
     * @param array          $block - block data.
     *
     * @return array.
     */
    public function prepare_block_attributes( $controls, $child_of = '', $block = null ) {
        $all_controls = lazyblocks()->controls()->get_controls();
        $attributes   = array();

        foreach ( $controls as $k => $control ) {
            if (
                isset( $control['child_of'] ) &&
                $control['child_of'] === $child_of &&
                $control['name']
            ) {
                $attribute_data = array(
                    'type'    => 'string',
                    'default' => isset( $control['default'] ) ? $control['default'] : null,
                );

                if ( isset( $control['save_in_meta'] ) && 'true' === $control['save_in_meta'] ) {
                    $attribute_data['source'] = 'meta';
                    $attribute_data['meta']   = isset( $control['save_in_meta_name'] ) && $control['save_in_meta_name'] ? $control['save_in_meta_name'] : $control['name'];
                }

                // get attribute type from control data.
                if ( isset( $control['type'] ) && isset( $all_controls[ $control['type'] ] ) ) {
                    $attribute_data['type'] = $all_controls[ $control['type'] ]['type'];

                    if ( 'number' === $attribute_data['type'] && null !== $attribute_data['default'] ) {
                        $attribute_data['default'] = (float) $attribute_data['default'];
                    }
                }

                $attributes[ $control['name'] ] = apply_filters( 'lzb/prepare_block_attribute', $attribute_data, $control, $controls, $k, $block );
            }
        }

        // reserved attributes.
        $attributes['lazyblock']        = array(
            'type'    => 'object',
            'default' => array(
                'slug' => $block['slug'],
            ),
        );
        $attributes['className']        = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['align']            = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['anchor']           = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['blockId']          = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['blockUniqueClass'] = array(
            'type'    => 'string',
            'default' => '',
        );

        // Ghost Kit.
        $attributes['ghostkitSpacings'] = array(
            'type'    => 'object',
            'default' => '',
        );
        $attributes['ghostkitSR']       = array(
            'type'    => 'string',
            'default' => '',
        );

        return $attributes;
    }

    /**
     * Eval custom user code and return as string.
     *
     * @param string $code - user code string.
     * @param array  $attributes - block attributes.
     *
     * @return string
     */
    // phpcs:disable
    public function php_eval( $code, $attributes ) {
        ob_start();

        eval( '?>' . $code );

        return ob_get_clean();
    }
    // phpcs:enable

    /**
     * Register block attributes, meta data, and custom frontend render callback if exists.
     */
    public function register_block_render() {
        $blocks = $this->get_blocks();

        foreach ( $blocks as $block ) {
            // Check if slug valid.
            $name_after_slug = explode( '/', $block['slug'] );
            $name_after_slug = isset( $name_after_slug[1] ) ? $name_after_slug[1] : '';

            if ( ! $block['slug'] || ! $name_after_slug ) {
                continue;
            }

            $attributes = $this->prepare_block_attributes( $block['controls'], '', $block );

            $data = array(
                'apiVersion'      => 2,
                'attributes'      => $attributes,
                'render_callback' => array( $this, 'render_callback' ),
                'example'         => array(),
                'editor_script'   => 'lazyblocks-editor',
                'editor_style'    => 'lazyblocks-editor',
            );

            // Register block type.
            register_block_type( $block['slug'], $data );

            // Register meta.
            foreach ( $attributes as $attribute ) {
                if ( isset( $attribute['meta'] ) && $attribute['meta'] ) {
                    register_meta(
                        'post',
                        $attribute['meta'],
                        array(
                            'show_in_rest' => true,
                            'single'       => true,
                            'type'         => $attribute['type'],
                            'default'      => $attribute['default'],
                        )
                    );
                }
            }
        }
    }

    /**
     * Render block custom frontend HTML.
     *
     * @param array  $attributes - The block attributes.
     * @param string $content - The block content.
     * @param string $context - block context [frontend, editor].
     * @param array  $block - Data containing the block's specifications (mostly used for live block preview in the block's constructor).
     *
     * @return string Returns the post content with latest posts added.
     */
    public function render_callback( $attributes, $content = null, $context = 'frontend', $block = null ) {
        if ( ! $block && ( ! isset( $attributes['lazyblock'] ) || ! isset( $attributes['lazyblock']['slug'] ) ) ) {
            return null;
        }
        if ( ! $block ) {
            $block = $this->get_block( $attributes['lazyblock']['slug'] );
        }

        $context = 'editor' === $context ? 'editor' : 'frontend';
        $result  = null;

        // phpcs:disable

        // apply filter for block attributes.
        $attributes = apply_filters( 'lzb/block_render/attributes', $attributes, $content, $block, $context );
        $attributes = apply_filters( $block['slug'] . '/' . $context . '_attributes', $attributes, $content, $block );
        $attributes = apply_filters( $block['slug'] . '/attributes', $attributes, $content, $block, $context );

        // apply filter for custom output callback.
        $result = apply_filters( 'lzb/block_render/callback', $result, $attributes, $context );
        $result = apply_filters( $block['slug'] . '/' . $context . '_callback', $result, $attributes );
        $result = apply_filters( $block['slug'] . '/callback', $result, $attributes, $context );

        // phpcs:enable

        // Custom render name.
        $custom_render_name = $context . '_html';
        if ( isset( $block['code']['output_method'] ) && isset( $block['code']['single_output'] ) && $block['code']['single_output'] ) {
            $custom_render_name = 'frontend_html';
        }

        // Custom output.
        if ( ! $result && isset( $block['code'] ) ) {
            $code = $block['code'];

            // Theme template file.
            if ( isset( $code['output_method'] ) && 'template' === $code['output_method'] ) {
                ob_start();
                $template_slug        = str_replace( '/', '-', $block ? $block['slug'] : $attributes['lazyblock']['slug'] );
                $template_path_editor = '/blocks/' . $template_slug . '/editor.php';
                $template_path        = '/blocks/' . $template_slug . '/block.php';
                $template_args        = array(
                    'attributes' => $attributes,
                    'block'      => $block,
                    'context'    => $context,
                );

                // Editor template.
                if ( 'editor' === $context && $this->template_exists( $template_path_editor, $template_args ) ) {
                    $this->include_template( $template_path_editor, $template_args );

                    // Frontend template.
                } elseif ( $this->template_exists( $template_path, $template_args ) ) {
                    $this->include_template( $template_path, $template_args );

                    // Template not found.
                } else {
                    $this->include_template( lazyblocks()->plugin_path . 'templates/template-not-found.php', $template_args );
                }

                $result = ob_get_clean();
                // Callback function.
            } elseif ( isset( $code[ $context . '_callback' ] ) && ! empty( $code[ $context . '_callback' ] ) && is_callable( $code[ $context . '_callback' ] ) ) {
                ob_start();
                call_user_func( $code[ $context . '_callback' ], $attributes );
                $result = ob_get_clean();

                // Custom code.
                // Previously we checked for empty, but we should output even an empty string
                // to prevent error message in the editor block preview.
            } elseif ( isset( $code[ $custom_render_name ] ) ) {
                // PHP output.
                if ( isset( $code['output_method'] ) && 'php' === $code['output_method'] ) {
                    $result = $this->php_eval( $code[ $custom_render_name ], $attributes );

                    // Handlebars.
                } else {
                    $result = $this->handlebars->render( $code[ $custom_render_name ], $attributes );
                }
            }
        }

        // add wrapper.
        $allow_wrapper = apply_filters( 'lzb/block_render/allow_wrapper', $result && 'frontend' === $context, $attributes, $context );
        // phpcs:ignore
        $allow_wrapper = apply_filters( $block['slug'] . '/' . $context . '_allow_wrapper', $allow_wrapper, $attributes );
        // phpcs:ignore
        $allow_wrapper = apply_filters( $block['slug'] . '/allow_wrapper', $allow_wrapper, $attributes, $context );

        if ( $allow_wrapper ) {
            $array_atts = array();

            if ( ! isset( $attributes['className'] ) ) {
                $attributes['className'] = '';
            }

            if ( $attributes['blockUniqueClass'] ) {
                $attributes['className'] .= ' ' . $attributes['blockUniqueClass'];
            }

            if ( $attributes['align'] ) {
                $attributes['className'] .= ' align' . $attributes['align'];
            }

            if ( $attributes['className'] ) {
                $attributes['className'] = trim( $attributes['className'] );
                $array_atts['class']     = esc_attr( $attributes['className'] );
            }
            if ( $attributes['anchor'] ) {
                $array_atts['id'] = esc_attr( $attributes['anchor'] );
            }

            if ( isset( $attributes['ghostkitSR'] ) && $attributes['ghostkitSR'] ) {
                $array_atts['data-ghostkit-sr'] = esc_attr( $attributes['ghostkitSR'] );
            }

            $html_atts = get_block_wrapper_attributes( $array_atts );

            $result = '<div ' . $html_atts . '>' . $result . '</div>';
        }

        // add filter for block output.
        $result = apply_filters( 'lzb/block_render/output', $result, $attributes, $context );
        // phpcs:ignore
        $result = apply_filters( $block['slug'] . '/' . $context . '_output', $result, $attributes );
        // phpcs:ignore
        $result = apply_filters( $block['slug'] . '/output', $result, $attributes, $context );

        return $result;
    }

    /**
     * Check if template exists.
     *
     * @param string $template_name file name.
     * @param array  $args args for template.
     */
    public function template_exists( $template_name, $args = array() ) {
        if ( ! empty( $args ) && is_array( $args ) ) {
	        // phpcs:ignore
            extract( $args );
        }

        // template in theme folder.
        $template = locate_template( array( $template_name ) );

        // Allow 3rd party plugin filter template file from their plugin.
        $template = apply_filters( 'lzb/block_render/template_exists', $template, $template_name, $args['attributes'], $args['block'], $args['context'] );
        // phpcs:ignore
        $template = apply_filters( $args['block']['slug'] . '/' . $args['context'] . '_template_exists', $template, $template_name, $args['attributes'], $args['block'] );
        // phpcs:ignore
        $template = apply_filters( $args['block']['slug'] . '/template_exists', $template, $template_name, $args['attributes'], $args['block'], $args['context'] );

        // DEPRECATED.
        $template = apply_filters( 'lzb/template_exists', $template, $template_name, $args );

        return file_exists( $template );
    }

    /**
     * Include template
     *
     * @param string $template_name file name.
     * @param array  $args args for template.
     */
    public function include_template( $template_name, $args = array() ) {
        if ( ! empty( $args ) && is_array( $args ) ) {
	        // phpcs:ignore
            extract( $args );
        }

        // template in theme folder.
        $template = locate_template( array( $template_name ) );

        // Allow 3rd party plugin filter template file from their plugin.
        $template = apply_filters( 'lzb/block_render/include_template', $template, $args['attributes'], $args['block'], $args['context'] );
        // phpcs:ignore
        $template = apply_filters( $args['block']['slug'] . '/' . $args['context'] . '_include_template', $template, $args['attributes'], $args['block'] );
        // phpcs:ignore
        $template = apply_filters( $args['block']['slug'] . '/include_template', $template, $args['attributes'], $args['block'], $args['context'] );

        // DEPRECATED.
        $template = apply_filters( 'lzb/include_template', $template, $template_name, $args );

        if ( file_exists( $template ) ) {
            include $template;
        }
    }
}
