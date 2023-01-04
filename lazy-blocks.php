<?php
/**
 * Plugin Name:  Lazy Blocks
 * Description:  Gutenberg blocks visual constructor. Custom meta fields or blocks with output without hard coding.
 * Version:      3.3.0
 * Author:       Lazy Blocks Team
 * Author URI:   https://www.lazyblocks.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=byline
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  lazy-blocks
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( 'LAZY_BLOCKS_VERSION' ) ) {
    define( 'LAZY_BLOCKS_VERSION', '3.3.0' );
}

if ( ! class_exists( 'LazyBlocks' ) ) :
    /**
     * LazyBlocks Class
     */
    class LazyBlocks {
        /**
         * The single class instance.
         *
         * @var null
         */
        private static $instance = null;

        /**
         * Main Instance
         * Ensures only one instance of this class exists in memory at any one time.
         */
        public static function instance() {
            if ( is_null( self::$instance ) ) {
                self::$instance = new self();
                self::$instance->init();
            }
            return self::$instance;
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
         * Plugin basename
         *
         * @var string
         */
        public $plugin_basename;

        /**
         * Icons class object.
         *
         * @var LazyBlocks_Icons
         */
        private $icons;

        /**
         * Controls class object.
         *
         * @var LazyBlocks_Controls
         */
        private $controls;

        /**
         * Blocks class object.
         *
         * @var LazyBlocks_Blocks
         */
        private $blocks;

        /**
         * Templates class object.
         *
         * @var LazyBlocks_Templates
         */
        private $templates;

        /**
         * Tools class object.
         *
         * @var LazyBlocks_Tools
         */
        private $tools;

        /**
         * LazyBlocks constructor.
         */
        public function __construct() {
            /* We do nothing here! */
        }

        /**
         * Activation Hook
         */
        public function activation_hook() {
            LazyBlocks_Dummy::add();
        }

        /**
         * Deactivation Hook
         */
        public function deactivation_hook() {}

        /**
         * Init.
         */
        public function init() {
            $this->plugin_path     = plugin_dir_path( __FILE__ );
            $this->plugin_url      = plugin_dir_url( __FILE__ );
            $this->plugin_basename = plugin_basename( __FILE__ );

            $this->load_text_domain();
            $this->include_dependencies();

            $this->icons     = new LazyBlocks_Icons();
            $this->controls  = new LazyBlocks_Controls();
            $this->blocks    = new LazyBlocks_Blocks();
            $this->templates = new LazyBlocks_Templates();
            $this->tools     = new LazyBlocks_Tools();

            add_action( 'init', array( $this, 'init_hook' ), 5 );
        }

        /**
         * Init hook should be used to register user blocks and add customizations.
         */
        public function init_hook() {
            do_action( 'lzb/init' );
        }

        /**
         * Get plugin_path.
         */
        public function plugin_path() {
            return apply_filters( 'lzb/plugin_path', $this->plugin_path );
        }

        /**
         * Get plugin_url.
         */
        public function plugin_url() {
            return apply_filters( 'lzb/plugin_url', $this->plugin_url );
        }

        /**
         * Get plugin_basename.
         */
        public function plugin_basename() {
            return apply_filters( 'lzb/plugin_basename', $this->plugin_basename );
        }

        /**
         * Sets the text domain with the plugin translated into other languages.
         */
        public function load_text_domain() {
            load_plugin_textdomain( 'lazy-blocks', false, dirname( $this->plugin_basename() ) . '/languages/' );
        }

        /**
         * Check if Pro plugin installed.
         */
        public function is_pro() {
            return defined( 'LAZY_BLOCKS_PRO' ) && LAZY_BLOCKS_PRO;
        }

        /**
         * Get URL to main site with UTM tags.
         *
         * @param array $args - Arguments of link.
         * @return string
         */
        public function get_plugin_site_url( $args = array() ) {
            $args       = array_merge(
                array(
                    'sub_path'     => 'pro',
                    'utm_source'   => 'plugin',
                    'utm_medium'   => 'admin_menu',
                    'utm_campaign' => 'go_pro',
                    'utm_content'  => LAZY_BLOCKS_VERSION,
                ),
                $args
            );
            $url        = 'https://www.lazyblocks.com/';
            $first_flag = true;

            if ( isset( $args['sub_path'] ) && ! empty( $args['sub_path'] ) ) {
                $url .= $args['sub_path'] . '/';
            }

            foreach ( $args as $key => $value ) {
                if ( 'sub_path' !== $key && ! empty( $value ) ) {
                    $url       .= ( $first_flag ? '?' : '&' );
                    $url       .= $key . '=' . $value;
                    $first_flag = false;
                }
            }

            return $url;
        }

        /**
         * Set plugin Dependencies.
         */
        private function include_dependencies() {
            // Deprecations run before all features.
            require_once $this->plugin_path() . 'classes/class-deprecated.php';

            require_once $this->plugin_path() . '/classes/class-migration.php';
            require_once $this->plugin_path() . '/classes/class-admin.php';
            require_once $this->plugin_path() . '/classes/class-icons.php';
            require_once $this->plugin_path() . '/classes/class-controls.php';
            require_once $this->plugin_path() . '/classes/class-blocks.php';
            require_once $this->plugin_path() . '/classes/class-templates.php';
            require_once $this->plugin_path() . '/classes/class-tools.php';
            require_once $this->plugin_path() . '/classes/class-rest.php';
            require_once $this->plugin_path() . '/classes/class-dummy.php';
            require_once $this->plugin_path() . '/classes/class-force-gutenberg.php';
            require_once $this->plugin_path() . '/classes/class-deactivate-duplicate-plugin.php';
            require_once $this->plugin_path() . '/classes/class-wpml.php';
        }

        /**
         * Get lazyblocks icons object.
         */
        public function icons() {
            return $this->icons;
        }

        /**
         * Get lazyblocks controls object.
         */
        public function controls() {
            return $this->controls;
        }

        /**
         * Get lazyblocks blocks object.
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
         * Get lazyblocks tools object.
         */
        public function tools() {
            return $this->tools;
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
    }

    /**
     * The main cycle of the plugin.
     *
     * @return null|LazyBlocks
     */
    function lazyblocks() {
        return LazyBlocks::instance();
    }

    // Initialize.
    lazyblocks();

    // Activation / Deactivation hooks.
    register_activation_hook( __FILE__, array( lazyblocks(), 'activation_hook' ) );
    register_deactivation_hook( __FILE__, array( lazyblocks(), 'deactivation_hook' ) );

    /**
     * Function to get meta value with some improvements for Lazyblocks metas.
     *
     * @param string   $name - metabox name.
     * @param int|null $id - post id.
     *
     * @return array|mixed|object
     */
    // phpcs:ignore
    function get_lzb_meta( $name, $id = null ) {
        // global variable used to fix `get_lzb_meta` call inside block preview in editor.
        global $lzb_preview_block_data;

        $control_data = null;

        if ( null === $id ) {
            global $post;

            if ( isset( $post->ID ) ) {
                $id = $post->ID;
            }
        }

        // Find control data by meta name.
        $blocks = lazyblocks()->blocks()->get_blocks();
        foreach ( $blocks as $block ) {
            if ( isset( $block['controls'] ) && is_array( $block['controls'] ) ) {
                foreach ( $block['controls'] as $control ) {
                    if ( $control_data || 'true' !== $control['save_in_meta'] ) {
                        continue;
                    }

                    $meta_name = false;

                    if ( isset( $control['save_in_meta_name'] ) && $control['save_in_meta_name'] ) {
                        $meta_name = $control['save_in_meta_name'];
                    } elseif ( $control['name'] ) {
                        $meta_name = $control['name'];
                    }

                    if ( $meta_name && $meta_name === $name ) {
                        $control_data = $control;
                    }
                }
            }
        }

        $result = null;

        if (
            isset( $lzb_preview_block_data ) &&
            is_array( $lzb_preview_block_data ) &&
            isset( $control_data['name'] ) &&
            isset( $lzb_preview_block_data['block_attributes'][ $control_data['name'] ] )
        ) {
            $result = $lzb_preview_block_data['block_attributes'][ $control_data['name'] ];
        } elseif ( $id ) {
            $result = get_post_meta( $id, $name, true );
        }

        return apply_filters( 'lzb/get_meta', $result, $name, $id, $control_data );
    }

endif;
