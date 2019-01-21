<?php
/**
 * Plugin Name:  Lazy Blocks
 * Description:  Gutenberg blocks visual constructor. Custom meta fields or blocks with output without hard coding.
 * Version:      @@plugin_version
 * Author:       nK
 * Author URI:   https://nkdev.info/
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  @@text_domain
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks Class
 */
class LazyBlocks {

    /**
     * The single class instance.
     *
     * @var null
     */
    private static $_instance = null;

    /**
     * Main Instance
     * Ensures only one instance of this class exists in memory at any one time.
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
            self::$_instance->init();
        }
        return self::$_instance;
    }

    /**
     * The base path to the plugin in the file system.
     *
     * @var string
     */
    public $plugin_path;

    /**
     * URL Link to plugin
     *
     * @var string
     */
    public $plugin_url;

    /**
     * Plugin Name: LazyBlocks
     *
     * @var string
     */
    public $plugin_name;

    /**
     * Plugin Version.
     *
     * @var string
     */
    public $plugin_version;

    /**
     * Creator of the plugin.
     *
     * @var string
     */
    public $plugin_author;

    /**
     * Slug of the plugin.
     *
     * @var string
     */
    public $plugin_slug;

    /**
     * I18n friendly version of Plugin Name.
     *
     * @var string
     */
    public $plugin_name_sanitized;

    /**
     * Blocks class object.
     *
     * @var object
     */
    private $blocks;

    /**
     * Templates class object.
     *
     * @var object
     */
    private $templates;

    /**
     * LazyBlocks constructor.
     */
    public function __construct() {
        /* We do nothing here! */
    }

    /**
     * Init.
     */
    public function init() {
        $this->plugin_path = plugin_dir_path( __FILE__ );
        $this->plugin_url = plugin_dir_url( __FILE__ );

        // get current plugin data.
        if ( ! function_exists( 'get_plugin_data' ) ) {
            require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
        }
        $data = get_plugin_data( __FILE__ );
        $this->plugin_name = $data['Name'];
        $this->plugin_version = $data['Version'];
        $this->plugin_author = $data['Author'];

        $this->plugin_slug = plugin_basename( __FILE__ );
        $this->plugin_name_sanitized = basename( __FILE__, '.php' );

        $this->load_text_domain();
        $this->add_actions();
        $this->include_dependencies();

        $this->blocks = new LazyBlocks_Blocks();
        $this->templates = new LazyBlocks_Templates();
        $this->tools = new LazyBlocks_Tools();

        add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    }

    /**
     * Sets the text domain with the plugin translated into other languages.
     */
    public function load_text_domain() {
        load_plugin_textdomain( '@@text_domain', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    /**
     * Set the main plugin handlers: Envato Sign Action, Save Cookie redirect.
     */
    public function add_actions() {
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
    }

    /**
     * Set plugin Dependencies.
     */
    private function include_dependencies() {
        require_once( $this->plugin_path . '/classes/class-blocks.php' );
        require_once( $this->plugin_path . '/classes/class-templates.php' );
        require_once( $this->plugin_path . '/classes/class-tools.php' );
        require_once( $this->plugin_path . '/classes/class-rest.php' );
    }

    /**
     * Get lazyblocks object.
     */
    public function blocks() {
        return $this->blocks;
    }

    /**
     * Get lazyblocks templates object.
     */
    public function templates() {
        return $this->templates;
    }

    /**
     * Add lazyblocks block.
     *
     * @param array $data - block data.
     */
    public function add_block( $data ) {
        return $this->blocks()->add_block( $data );
    }

    /**
     * Add lazyblocks template.
     *
     * @param array $data - template data.
     */
    public function add_template( $data ) {
        return $this->templates()->add_template( $data );
    }

    /**
     * Admin menu.
     */
    public function admin_menu() {
        // Documentation menu link.
        add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'Documentation', '@@text_domain' ),
            esc_html__( 'Documentation', '@@text_domain' ),
            'manage_options',
            'https://lazyblocks.com/documentation/getting-started/'
        );
    }

    /**
     * Enqueue admin styles and scripts.
     */
    public function admin_enqueue_scripts() {
        global $post;
        global $post_type;
        global $wp_locale;

        if ( 'lazyblocks' === $post_type || 'lazyblocks_templates' === $post_type ) {
            wp_enqueue_style( 'dashicons-picker', lazyblocks()->plugin_url . 'vendor/dashicons-picker/css/dashicons-picker.css', array( 'dashicons' ), '1.0', false );
            wp_enqueue_script( 'dashicons-picker', lazyblocks()->plugin_url . 'vendor/dashicons-picker/js/dashicons-picker.js', array( 'jquery' ), '1.1', true );

            wp_enqueue_style( 'selectize', lazyblocks()->plugin_url . 'vendor/selectize/css/selectize.css', array( 'dashicons' ), '0.12.4', false );
            wp_enqueue_script( 'selectize', lazyblocks()->plugin_url . 'vendor/selectize/js/standalone/selectize.min.js', array( 'jquery' ), '0.12.4', true );

            wp_enqueue_script( 'conditionize', lazyblocks()->plugin_url . 'vendor/conditionize/conditionize.js', array( 'jquery' ), '', true );

            wp_enqueue_script( 'sortablejs', lazyblocks()->plugin_url . 'vendor/sortablejs/Sortable.min.js', array( 'jquery' ), '', true );
        }

        wp_enqueue_script( 'date_i18n', lazyblocks()->plugin_url . 'vendor/date_i18n/date_i18n.js', array(), '1.0.0', true );

        $month_names = array_map( array( &$wp_locale, 'get_month' ), range( 1, 12 ) );
        $month_names_short = array_map( array( &$wp_locale, 'get_month_abbrev' ), $month_names );
        $day_names = array_map( array( &$wp_locale, 'get_weekday' ), range( 0, 6 ) );
        $day_names_short = array_map( array( &$wp_locale, 'get_weekday_abbrev' ), $day_names );

        wp_localize_script( 'date_i18n', 'DATE_I18N', array(
            'month_names' => $month_names,
            'month_names_short' => $month_names_short,
            'day_names' => $day_names,
            'day_names_short' => $day_names_short,
        ) );

        wp_enqueue_style( 'lazyblocks-admin', $this->plugin_url . 'assets/admin/css/style.min.css', '', '@@plugin_version' );
        wp_enqueue_script( 'lazyblocks-admin', $this->plugin_url . 'assets/admin/js/script.min.js', array( 'jquery', 'wp-api' ), '@@plugin_version', true );
        wp_localize_script(
            'lazyblocks-admin', 'lazyblocksData', array(
                'nonce'    => wp_create_nonce( 'ajax-nonce' ),
                'url'      => admin_url( 'admin-ajax.php' ),
                'controls' => isset( $post->ID ) ? get_post_meta( $post->ID, 'lazyblocks_controls', true ) ? : array() : array(),
            )
        );
    }
}

/**
 * The main cycle of the plugin.
 *
 * @return null|LazyBlocks
 */
function lazyblocks() {
    return LazyBlocks::instance();
}
add_action( 'plugins_loaded', 'lazyblocks' );

/**
 * Function to get meta value with some improvements for Lazyblocks metas.
 *
 * @param string   $name - metabox name.
 * @param int|null $id - post id.
 *
 * @return array|mixed|object
 */
function get_lzb_meta( $name, $id = null ) {
    $fix_meta_value = false;
    $default = null;

    if ( null === $id ) {
        global $post;
        $id = $post->ID;
    }

    $blocks = lazyblocks()->blocks()->get_blocks();
    foreach ( $blocks as $block ) {
        if ( isset( $block['controls'] ) && is_array( $block['controls'] ) ) {
            foreach ( $block['controls'] as $control ) {
                if ( $control['save_in_meta_name'] === $name ) {
                    // get all Image and Gallery metabox names.
                    if (
                        'true' === $control['save_in_meta'] &&
                        $control['save_in_meta_name'] &&
                        ( 'image' === $control['type'] || 'gallery' === $control['type'] )
                    ) {
                        $fix_meta_value = true;
                    }

                    switch ( $control['type'] ) {
                        case 'image':
                        case 'gallery':
                        case 'code_editor':
                            break;
                        case 'checkbox':
                        case 'toggle':
                            $default = 'true' === $control['checked'] ? 1 : 0;
                            break;
                        default:
                            $default = $control['default'];
                            break;
                    }
                }
            }
        }
    }

    $result = get_post_meta( $id, $name, true );

    if ( ! $result ) {
        $result = $default;
    }

    // find Image and Gallery controls with meta data to fix it.
    if ( $fix_meta_value ) {
        $result = json_decode( urldecode( $result ), true );
    }

    return $result;
}
