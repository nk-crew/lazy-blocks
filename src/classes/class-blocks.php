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
     * LazyBlocks_Blocks constructor.
     */
    public function __construct() {
        $this->prepare_handlebars();

        add_action( 'init', array( $this, 'register_post_type' ) );

        // custom post roles.
        add_action( 'admin_init', array( $this, 'add_role_caps' ) );

        // additional columns in blocks list table.
        add_filter( 'manage_lazyblocks_posts_columns', array( $this, 'add_lazyblocks_columns' ) );
        add_filter( 'manage_lazyblocks_posts_custom_column', array( $this, 'manage_lazyblocks_columns' ), 10, 2 );

        // add general metaboxes.
        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ), 1 );
        add_action( 'save_post', array( $this, 'save_meta_boxes' ), 10, 2 );

        // add meta.
        add_action( 'init', array( $this, 'register_block_meta' ) );

        // add gutenberg blocks assets.
        if ( function_exists( 'register_block_type' ) ) {
            // add custom block categories.
            add_filter( 'block_categories', array( $this, 'block_categories' ) );

            add_action( 'enqueue_block_editor_assets', array( $this, 'register_block' ) );
            add_action( 'init', array( $this, 'register_block_render' ) );
        }
    }

    /**
     * Handlebars php.
     */
    public function prepare_handlebars() {
        require_once lazyblocks()->plugin_path . 'vendor/Handlebars/Autoloader.php';

        Handlebars\Autoloader::register();

        $this->handlebars = new Handlebars\Handlebars();

        // truncate
        // {{truncate 'string' 2 'true'}}.
        $this->handlebars->registerHelper( 'truncate', function( $str, $len, $ellipsis = 'true' ) {
            if ( $str && $len && mb_strlen( $str ) > $len ) {
                $new_str = mb_substr( $str, 0, $len + 1 );
                $count = mb_strlen( $new_str );

                while ( $count > 0 ) {
                    $ch = mb_substr( $new_str, -1 );
                    $new_str = mb_substr( $new_str, 0, -1 );

                    $count--;

                    if ( ' ' === $ch ) {
                        break;
                    }
                }

                if ( '' === $new_str ) {
                    $new_str = mb_substr( $str, 0, $len );
                }

                return new \Handlebars\SafeString( $new_str . ( 'true' === $ellipsis ? '...' : '' ) );
            }
            return $str;
        } );

        // compare.
        // {{#compare 1 '===' 2}} Show if true {{/compare}}
        // slightly changed https://gist.github.com/doginthehat/1890659.
        $this->handlebars->registerHelper( 'compare', function( $lvalue, $operator, $rvalue = null, $options = null ) {
            if ( null === $rvalue ) {
                return $options['inverse']();
            }

            if ( null === $options ) {
                $options = $rvalue;
                $rvalue = $operator;
                $operator = '===';
            }

            $result = false;

            switch ( $operator ) {
                case '==':
                    $result = $lvalue == $rvalue;
                    break;
                case '===':
                    $result = $lvalue === $rvalue;
                    break;
                case '!=':
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
        } );

        // math.
        // {{math 1 '+' 2}}
        // https://stackoverflow.com/questions/33059203/error-missing-helper-in-handlebars-js/46317662#46317662.
        $this->handlebars->registerHelper( 'math', function( $lvalue, $operator, $rvalue ) {
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
        } );

        // do_shortcode.
        // {{{do_shortcode 'my_shortcode' this}}}.
        $this->handlebars->registerHelper( 'do_shortcode', function( $shortcode_name, $attributes ) {
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
                        $val = json_encode( $val );
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
        } );

        // date_i18n.
        // {{date_i18n 'F j, Y H:i' '2018-09-16 15:35'}}.
        $this->handlebars->registerHelper( 'date_i18n', function( $format, $time ) {
            return date_i18n( $format, strtotime( $time ) );
        } );

        // custom action for extending default helpers by 3rd-party.
        do_action( 'lzb_handlebars_object', $this->handlebars );
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
                'show_in_menu' => true,
                'show_in_admin_bar' => true,
                'show_in_rest' => true,
                'menu_icon'    => 'dashicons-editor-table',
                'menu_position' => 80,
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
     * Add featured image in lazyblocks list
     *
     * @param array $columns columns of the table.
     *
     * @return array
     */
    public function add_lazyblocks_columns( $columns = array() ) {
        $columns = array_merge(
            // insert after checkbox.
            array_slice( $columns, 0, 1 ),
            array(
                'lazyblocks_post_icon' => esc_html__( 'Icon', '@@text_domain' ),
            ),
            // insert after title.
            array_slice( $columns, 1, 1 ),
            array(
                'lazyblocks_post_category' => esc_html__( 'Category', '@@text_domain' ),
            ),
            array_slice( $columns, 1 )
        );

        return $columns;
    }

    /**
     * Add thumb to the column
     *
     * @param bool $column_name column name.
     */
    public function manage_lazyblocks_columns( $column_name = false ) {
        global $post;

        if ( 'lazyblocks_post_icon' === $column_name ) {
            $icon = $this->get_meta_value( 'lazyblocks_icon' );
            if ( $icon ) {
                echo '<span class="lzb-admin-block-icon"><span class="dashicons ' . esc_attr( $icon ) . '"></span></span>';
            }
        }

        if ( 'lazyblocks_post_category' === $column_name ) {
            $category = $this->get_meta_value( 'lazyblocks_category' );
            if ( $category ) {
                $gutenberg_categories = array();
                if ( function_exists( 'get_block_categories' ) ) {
                    $gutenberg_categories = get_block_categories( $post );
                } else if ( function_exists( 'gutenberg_get_block_categories' ) ) {
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

        'lazyblocks_slug'                   => '',
        'lazyblocks_icon'                   => '',
        'lazyblocks_description'            => '',
        'lazyblocks_keywords'               => '',
        'lazyblocks_category'               => 'common',

        'lazyblocks_code_editor_html'       => '',
        'lazyblocks_code_editor_callback'   => '',
        'lazyblocks_code_editor_css'        => '',
        'lazyblocks_code_frontend_html'     => '',
        'lazyblocks_code_frontend_callback' => '',
        'lazyblocks_code_frontend_css'      => '',

        'lazyblocks_supports_multiple'      => 'true',
        'lazyblocks_supports_classname'     => 'true',
        'lazyblocks_supports_anchor'        => 'false',
        'lazyblocks_supports_html'          => 'false',
        'lazyblocks_supports_inserter'      => 'true',
        'lazyblocks_supports_align'         => array( 'wide', 'full' ),

        /*
            TODO: GhostKit extensions support when will be resolved https://github.com/WordPress/gutenberg/issues/9901
            'lazyblocks_supports_ghostkit_indents' => 'false',
            'lazyblocks_supports_ghostkit_display' => 'false',
         */

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
        global $post;

        wp_nonce_field( basename( __FILE__ ), 'lazyblocks_metabox_nonce' );

        $blocks = $this->get_blocks();

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

        /*
            TODO: GhostKit extensions support when will be resolved https://github.com/WordPress/gutenberg/issues/9901
            $supports_ghostkit_indents = $this->get_meta_value( 'lazyblocks_supports_ghostkit_indents' );
            $supports_ghostkit_display = $this->get_meta_value( 'lazyblocks_supports_ghostkit_display' );
        */

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
                <?php
                $gutenberg_categories = array();
                if ( function_exists( 'get_block_categories' ) ) {
                    $gutenberg_categories = get_block_categories( $post );
                } else if ( function_exists( 'gutenberg_get_block_categories' ) ) {
                    $gutenberg_categories = gutenberg_get_block_categories( $post );
                }

                $custom_categories = $this->get_blocks_categories();

                foreach ( $gutenberg_categories as $cat ) {
                    // don't add blocks in reusable category.
                    if ( 'reusable' === $cat['slug'] ) {
                        continue;
                    }

                    // custom categories saved without slug in the DB, so we need to get it separatelly.
                    // fix for https://github.com/nk-o/lazy-blocks/issues/17.
                    $slug = $cat['slug'];
                    if ( isset( $custom_categories[ $slug ] ) ) {
                        $slug = $custom_categories[ $slug ];
                    }

                    ?>
                    <option value="<?php echo esc_html( $slug ); ?>" <?php selected( $slug, $category ); ?>><?php echo esc_html( $cat['title'] ); ?></option>
                    <?php
                }
                ?>
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
            <label><?php echo esc_html__( 'Additional settings', '@@text_domain' ); ?></label>

            <label>
                <input type="hidden" name="lazyblocks_supports_multiple" id="lazyblocks_supports_multiple_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_multiple" id="lazyblocks_supports_multiple" value="true" <?php checked( $supports_multiple ); ?>>
                <?php echo esc_html__( 'Multiple', '@@text_domain' ); ?>
            </label>
            <p class="description"><?php echo esc_html__( 'Allow use block multiple times on the page.', '@@text_domain' ); ?></p>

            <label>
                <input type="hidden" name="lazyblocks_supports_classname" id="lazyblocks_supports_classname_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_classname" id="lazyblocks_supports_classname" value="true" <?php checked( $supports_classname ); ?>>
                <?php echo esc_html__( 'Class Name', '@@text_domain' ); ?>
            </label>
            <p class="description"><?php echo esc_html__( 'Additional field to add custom class name.', '@@text_domain' ); ?></p>

            <label>
                <input type="hidden" name="lazyblocks_supports_anchor" id="lazyblocks_supports_anchor_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_anchor" id="lazyblocks_supports_anchor" value="true" <?php checked( $supports_anchor ); ?>>
                <?php echo esc_html__( 'Anchor', '@@text_domain' ); ?>
            </label>
            <p class="description"><?php echo esc_html__( 'Additional field to add block ID attribute.', '@@text_domain' ); ?></p>

            <label>
                <input type="hidden" name="lazyblocks_supports_inserter" id="lazyblocks_supports_inserter_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_inserter" id="lazyblocks_supports_inserter" value="true" <?php checked( $supports_inserter ); ?>>
                <?php echo esc_html__( 'Inserter', '@@text_domain' ); ?>
            </label>
            <p class="description"><?php echo esc_html__( 'Show block in blocks inserter.', '@@text_domain' ); ?></p>

            <div class="disabled">
                <label>
                    <input type="hidden" name="lazyblocks_supports_html" id="lazyblocks_supports_html_hidden" value="false">
                    <input class="lzb-input" type="checkbox" name="lazyblocks_supports_html" id="lazyblocks_supports_html" value="true" <?php checked( $supports_html ); ?>>
                    <?php echo esc_html__( 'HTML', '@@text_domain' ); ?>
                </label>
                <p class="description"><?php echo esc_html__( 'Allow convert block to HTML.', '@@text_domain' ); ?></p>
            </div>
        </div>

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

        <?php

        /*
        // TODO: GhostKit extensions support when will be resolved https://github.com/WordPress/gutenberg/issues/9901
        <div class="lzb-metabox">
            <label><?php echo esc_html__( 'GhostKit Extensions', '@@text_domain' ); ?></label>
            <label>
                <input type="hidden" name="lazyblocks_supports_ghostkit_indents" id="lazyblocks_supports_ghostkit_indents_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_ghostkit_indents" id="lazyblocks_supports_ghostkit_indents" value="true" <?php checked( $supports_ghostkit_indents ); ?>>
                <?php echo esc_html__( 'Indents (paddings, margins)', '@@text_domain' ); ?>
            </label>
            <label>
                <input type="hidden" name="lazyblocks_supports_ghostkit_display" id="lazyblocks_supports_ghostkit_display_hidden" value="false">
                <input class="lzb-input" type="checkbox" name="lazyblocks_supports_ghostkit_display" id="lazyblocks_supports_ghostkit_display" value="true" <?php checked( $supports_ghostkit_display ); ?>>
                <?php echo esc_html__( 'Display (show/hide block on different devices)', '@@text_domain' ); ?>
            </label>
            <p><em><?php echo esc_html__( 'Required GhostKit plugin active.', '@@text_domain' ); ?></em></p>
        </div>
        */
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
     * Print editor notes
     */
    private function print_editor_notes() {
        ?>
        <div class="lzb-metabox">
            <p>
                <?php
                // translators: %1$s - documentation link.
                echo wp_kses_post( sprintf( __( 'You can use PHP to output block <a href="%1$s">%1$s</a>', '@@text_domain' ), 'https://lazyblocks.com/documentation/blocks-code/php/' ) );
                ?>
            </p>
            <hr>
            <p class="description">
                <?php echo esc_html__( 'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.', '@@text_domain' ); ?>
            </p>
            <p class="description">
                <?php echo wp_kses_post( __( 'Note 2: supported Handlebars syntax with your controls available by name. For example, if you have control with name <strong>my_control</strong>, you can print it <strong>{{my_control}}</strong>.', '@@text_domain' ) ); ?>
            </p>
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
        $block_slug = 'lazyblock/' . $this->get_meta_value( 'lazyblocks_slug' );

        /*
            $editor_css = $this->get_meta_value( 'lazyblocks_code_editor_css' ) ? : '';
            $frontend_css = $this->get_meta_value( 'lazyblocks_code_frontend_css' ) ? : '';
         */

        ?>
        <div class="lzb-metabox-tabs">
            <div class="lzb-metabox-tabs-buttons">
                <a href="#" class="lzb-metabox-tabs-btn lzb-metabox-tabs-btn-active">
                    <?php echo esc_html__( 'Frontend HTML', '@@text_domain' ); ?>
                </a>
                <a href="#" class="lzb-metabox-tabs-btn">
                    <?php echo esc_html__( 'Editor HTML', '@@text_domain' ); ?>
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
                    <?php if ( has_filter( $block_slug . '/frontend_callback' ) ) : ?>
                        <p>
                            <?php
                            // translators: %1$s - filter name.
                            echo wp_kses_post( sprintf( __( 'For block output used filter: %s' ), '<code>' . $block_slug . '/frontend_callback</code>' ) );
                            ?>
                        </p>
                        <?php /* Output hidden Frontend HTML data to prevent losing it after save */ ?>
                        <textarea class="lzb-textarea" name="lazyblocks_code_frontend_html" style="display: none;"><?php echo esc_textarea( $frontend_html ); ?></textarea>
                    <?php else : ?>
                        <div class="lzb-metabox">
                            <textarea class="lzb-textarea" id="lazyblocks_code_frontend_html" name="lazyblocks_code_frontend_html"><?php echo esc_textarea( $frontend_html ); ?></textarea>
                        </div>
                        <?php $this->print_editor_notes(); ?>
                    <?php endif; ?>
                </div>
                <div class="lzb-metabox-tabs-content-item">
                    <?php if ( has_filter( $block_slug . '/editor_callback' ) ) : ?>
                        <p>
                            <?php
                            // translators: %1$s - filter name.
                            echo wp_kses_post( sprintf( __( 'For block output used filter: %s' ), '<code>' . $block_slug . '/editor_callback</code>' ) );
                            ?>
                        </p>
                        <?php /* Output hidden Editor HTML data to prevent losing it after save */ ?>
                        <textarea class="lzb-textarea" name="lazyblocks_code_editor_html" style="display: none;"><?php echo esc_textarea( $editor_html ); ?></textarea>
                    <?php else : ?>
                        <div class="lzb-metabox">
                            <textarea class="lzb-textarea" id="lazyblocks_code_editor_html" name="lazyblocks_code_editor_html"><?php echo esc_textarea( $editor_html ); ?></textarea>
                        </div>
                        <?php $this->print_editor_notes(); ?>
                    <?php endif; ?>
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
                if ( 'choices' === $key || 'help' === $key ) {
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
                    // phpcs:ignore
                    $new_meta_value = wp_unslash( $_POST[ $meta ] );
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

                // prepare controls.
                foreach ( $controls as $k => $control ) {
                    if ( 'select' === $control['type'] && isset( $control['allow_null'] ) && 'true' === $control['allow_null'] ) {
                        array_unshift( $controls[ $k ]['choices'], array(
                            'value' => 'null',
                            'label' => esc_html__( '-- Select --', '@@text_domain' ),
                        ) );
                    }
                }

                $this->blocks[] = array(
                    'id'             => $block->ID,
                    'title'          => $block->post_title,
                    'icon'           => $icon,
                    'keywords'       => $keywords,
                    'slug'           => 'lazyblock/' . esc_html( $this->get_meta_value( 'lazyblocks_slug', $block->ID ) ),
                    'description'    => esc_html( $this->get_meta_value( 'lazyblocks_description', $block->ID ) ),
                    'category'       => $this->sanitize_slug( esc_html( $this->get_meta_value( 'lazyblocks_category', $block->ID ) ) ),
                    'category_label' => esc_html( $this->get_meta_value( 'lazyblocks_category', $block->ID ) ),
                    'supports'       => array(
                        'customClassName' => $this->get_meta_value( 'lazyblocks_supports_classname', $block->ID ),
                        'anchor'          => $this->get_meta_value( 'lazyblocks_supports_anchor', $block->ID ),
                        'align'           => (array) $this->get_meta_value( 'lazyblocks_supports_align', $block->ID ),
                        'html'            => $this->get_meta_value( 'lazyblocks_supports_html', $block->ID ),
                        'multiple'        => $this->get_meta_value( 'lazyblocks_supports_multiple', $block->ID ),
                        'inserter'        => $this->get_meta_value( 'lazyblocks_supports_inserter', $block->ID ),

                        /*
                            TODO: GhostKit extensions support when will be resolved https://github.com/WordPress/gutenberg/issues/9901
                            'ghostkitIndents' => $this->get_meta_value( 'lazyblocks_supports_ghostkit_indents', $block->ID ),
                            'ghostkitDisplay' => $this->get_meta_value( 'lazyblocks_supports_ghostkit_display', $block->ID ),
                        */
                    ),
                    'controls'      => $controls,
                    'code'          => array(
                        'editor_html'       => $this->get_meta_value( 'lazyblocks_code_editor_html', $block->ID ),
                        'editor_callback'   => '',
                        'editor_css'        => $this->get_meta_value( 'lazyblocks_code_editor_css', $block->ID ),
                        'frontend_html'     => $this->get_meta_value( 'lazyblocks_code_frontend_html', $block->ID ),
                        'frontend_callback' => '',
                        'frontend_css'      => $this->get_meta_value( 'lazyblocks_code_frontend_css', $block->ID ),
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
        $blocks = $this->get_blocks( $db_only );
        $default_categories = array(
            'common',
            'embed',
            'formatting',
            'layout',
            'widgets',
            'reusable',
        );

        $custom_categories = array();

        foreach ( $blocks as $block ) {
            if (
                ! isset( $default_categories[ $block['category'] ] ) &&
                ! isset( $custom_categories[ $block['category'] ] ) &&
                ! in_array( $block['category'], $default_categories ) &&
                isset( $block['category_label'] )
            ) {
                $custom_categories[ $block['category'] ] = $block['category_label'];
            }
        }

        return $custom_categories;
    }

    /**
     * Register custom categories for blocks
     *
     * @param array $categories - available categories.
     * @return array
     */
    public function block_categories( $categories ) {
        // lazyblocks core category.
        $categories[] = array(
            'slug'  => 'lazyblocks',
            'title' => esc_html__( 'Lazy Blocks', '@@text_domain' ),
        );

        $new_categories = $this->get_blocks_categories();
        if ( ! empty( $new_categories ) ) {
            foreach ( $new_categories as $slug => $category ) {
                $categories[] = array(
                    'slug'  => $slug,
                    'title' => $category,
                );
            }
        }

        return $categories;
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
            array(),
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
     * Prepare attributes.
     * The same function placed in block JSX file.
     *
     * @param array          $controls - controls list.
     * @param string|boolean $child_of - childOf control name.
     * @param array          $block - block data.
     *
     * @return array.
     */
    public function prepare_block_attributes( $controls, $child_of = '', $block ) {
        $attributes = array();

        foreach ( $controls as $k => $control ) {
            if ( isset( $control['child_of'] ) && $control['child_of'] === $child_of ) {
                $type        = 'string';
                $default_val = isset( $control['default'] ) ? $control['default'] : null;

                if ( $control['type'] ) {
                    switch ( $control['type'] ) {
                        case 'number':
                        case 'range':
                            $type = 'number';
                            $default_val = (float) $default_val;
                            break;
                        case 'checkbox':
                        case 'toggle':
                            $type        = 'boolean';
                            $default_val = 'true' === $control['checked'];
                            break;
                        case 'inner_blocks':
                            $type        = 'string';

                            // this value will be detected in render callback and added inner blocks content.
                            $default_val = '@@lazy_blocks_inner_blocks';
                            break;
                        case 'repeater':
                            $default_val  = array();
                            $inner_blocks = $this->prepare_block_attributes( $controls, $k, $block );

                            foreach ( $inner_blocks as $n => $inner_block ) {
                                $default_val[ $n ] = $inner_blocks[ $n ]['default'];
                            }

                            $default_val = urlencode( json_encode( array( $default_val ) ) );
                            break;
                    }
                }

                $attributes[ $control['name'] ] = array(
                    'type'    => $type,
                );
                if ( null !== $default_val ) {
                    $attributes[ $control['name'] ]['default'] = $default_val;
                }

                if ( 'true' === $control['save_in_meta'] && $control['save_in_meta_name'] ) {
                    $attributes[ $control['name'] ]['source'] = 'meta';
                    $attributes[ $control['name'] ]['meta']   = $control['save_in_meta_name'];
                }
            }
        }

        // reserved attributes.
        $attributes['lazyblock'] = array(
            'type'    => 'object',
            'default' => array(
                'slug' => $block['slug'],
            ),
        );
        $attributes['className'] = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['align'] = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['anchor'] = array(
            'type'      => 'string',
            'source'    => 'attribute',
            'attribute' => 'id',
            'selector'  => '*',
            'default'   => '',
        );
        $attributes['blockId'] = array(
            'type'    => 'string',
            'default' => '',
        );
        $attributes['blockUniqueClass'] = array(
            'type'    => 'string',
            'default' => '',
        );

        return $attributes;
    }

    /**
     * Register block attributes and custom frontend render callback if exists.
     */
    public function register_block_render() {
        $blocks = $this->get_blocks();

        foreach ( $blocks as $block ) {
            $data = array(
                'attributes' => $this->prepare_block_attributes( $block['controls'], '', $block ),
                'render_callback' => array( $this, 'render_callback' ),
            );

            register_block_type( $block['slug'], $data );
        }
    }

    /**
     * Render block custom frontend HTML.
     *
     * @param array  $attributes The block attributes.
     * @param string $content The block content.
     * @param string $context - block context [frontend, editor].
     *
     * @return string Returns the post content with latest posts added.
     */
    public function render_callback( $attributes, $content = null, $context = 'frontend' ) {
        if ( ! isset( $attributes['lazyblock'] ) || ! isset( $attributes['lazyblock']['slug'] ) ) {
            return '';
        }

        $check_array = '%5B%7B%22';
        $check_array_alt = '%7B%22';
        $block = $this->get_block( $attributes['lazyblock']['slug'] );
        $context = 'editor' === $context ? 'editor' : 'frontend';
        $result = '';

        foreach ( $attributes as $k => $attr ) {
            // prepare decoded arrays to actual arrays.
            if ( is_string( $attr ) ) {
                if ( substr( $attr, 0, strlen( $check_array ) ) === $check_array || substr( $attr, 0, strlen( $check_array_alt ) ) === $check_array_alt ) {
                    $attributes[ $k ] = json_decode( urldecode( $attr ), true );
                }
            }

            // prepare content attribute.
            if ( '@@lazy_blocks_inner_blocks' === $attr ) {
                $attributes[ $k ] = $content ? : '';
            }
        }

        // apply filter for custom output callback.
        $result = apply_filters( $block['slug'] . '/' . $context . '_callback', '', $attributes );

        // custom callback and handlebars html.
        if ( ! $result && isset( $block['code'] ) ) {
            if ( isset( $block['code'][ $context . '_callback' ] ) && ! empty( $block['code'][ $context . '_callback' ] ) && is_callable( $block['code'][ $context . '_callback' ] ) ) {
                ob_start();
                call_user_func( $block['code'][ $context . '_callback' ], $attributes );
                $result = ob_get_contents();
                ob_end_clean();
            } else if ( isset( $block['code'][ $context . '_html' ] ) && ! empty( $block['code'][ $context . '_html' ] ) ) {
                $result = $this->handlebars->render( $block['code'][ $context . '_html' ], $attributes );
            }
        }

        // add wrapper.
        $allow_wrapper = apply_filters( $block['slug'] . '/' . $context . '_allow_wrapper', $result && 'frontend' === $context, $attributes );
        if ( $allow_wrapper ) {
            $html_atts = '';

            $attributes['className'] .= ' wp-block-' . str_replace( '/', '-', $attributes['lazyblock']['slug'] );

            if ( $attributes['blockUniqueClass'] ) {
                $attributes['className'] .= ' ' . $attributes['blockUniqueClass'];
            }

            if ( $attributes['align'] ) {
                $attributes['className'] .= ' align' . $attributes['align'];
            }

            if ( $attributes['className'] ) {
                $html_atts .= ' class="' . esc_attr( $attributes['className'] ) . '"';
            }
            if ( $attributes['anchor'] ) {
                $html_atts .= ' id="' . esc_attr( $attributes['anchor'] ) . '"';
            }

            $result = '<div' . $html_atts . '>' . $result . '</div>';
        }

        return $result;
    }
}
