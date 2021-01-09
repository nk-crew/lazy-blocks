<?php
/**
 * LazyBlocks admin.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Admin class. Class to work with LazyBlocks Controls.
 */
class LazyBlocks_Admin {
    /**
     * LazyBlocks_Admin constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'admin_menu' ) );
        add_action( 'admin_menu', array( $this, 'maybe_hide_menu_item' ), 12 );

        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'constructor_enqueue_scripts' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_translations' ), 9 );

        add_filter( 'admin_footer_text', array( $this, 'admin_footer_text' ) );
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

        // PRO plugin survive link.
        add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'PRO Survey', '@@text_domain' ),
            esc_html__( 'PRO Survey', '@@text_domain' ),
            'manage_options',
            'https://forms.gle/oopKhfBanaehVM7aA'
        );
    }

    /**
     * Maybe hide admin menu item.
     */
    public function maybe_hide_menu_item() {
        $show_menu_item = apply_filters( 'lzb/show_admin_menu', true );

        if ( ! $show_menu_item ) {
            remove_menu_page( 'edit.php?post_type=lazyblocks' );
        }
    }

    /**
     * Enqueue admin styles and scripts.
     */
    public function admin_enqueue_scripts() {
        global $wp_locale;

        wp_enqueue_script( 'date_i18n', lazyblocks()->plugin_url() . 'vendor/date_i18n/date_i18n.js', array(), '1.0.0', true );

        $month_names       = array_map( array( &$wp_locale, 'get_month' ), range( 1, 12 ) );
        $month_names_short = array_map( array( &$wp_locale, 'get_month_abbrev' ), $month_names );
        $day_names         = array_map( array( &$wp_locale, 'get_weekday' ), range( 0, 6 ) );
        $day_names_short   = array_map( array( &$wp_locale, 'get_weekday_abbrev' ), $day_names );

        wp_localize_script(
            'date_i18n',
            'DATE_I18N',
            array(
                'month_names'       => $month_names,
                'month_names_short' => $month_names_short,
                'day_names'         => $day_names,
                'day_names_short'   => $day_names_short,
            )
        );

        wp_enqueue_style( 'lazyblocks-admin', lazyblocks()->plugin_url() . 'assets/admin/css/style.min.css', '', '@@plugin_version' );
        wp_style_add_data( 'lazyblocks-admin', 'rtl', 'replace' );
        wp_style_add_data( 'lazyblocks-admin', 'suffix', '.min' );
    }

    /**
     * Enqueue constructor styles and scripts.
     */
    public function constructor_enqueue_scripts() {
        if ( 'lazyblocks' === get_post_type() ) {
            wp_enqueue_script(
                'lazyblocks-constructor',
                lazyblocks()->plugin_url() . 'assets/admin/constructor/index.min.js',
                array( 'wp-blocks', 'wp-editor', 'wp-block-editor', 'wp-i18n', 'wp-element', 'wp-components', 'lodash', 'jquery' ),
                '@@plugin_version',
                true
            );
            wp_localize_script(
                'lazyblocks-constructor',
                'lazyblocksConstructorData',
                array(
                    'post_id'             => get_the_ID(),
                    'allowed_mime_types'  => get_allowed_mime_types(),
                    'controls'            => lazyblocks()->controls()->get_controls(),
                    'controls_categories' => lazyblocks()->controls()->get_controls_categories(),
                    'icons'               => lazyblocks()->icons()->get_all(),
                )
            );

            wp_enqueue_style( 'lazyblocks-constructor', lazyblocks()->plugin_url() . 'assets/admin/constructor/style.min.css', array(), '@@plugin_version' );
            wp_style_add_data( 'lazyblocks-constructor', 'rtl', 'replace' );
            wp_style_add_data( 'lazyblocks-constructor', 'suffix', '.min' );
        }
    }

    /**
     * Add script translations.
     */
    public function enqueue_script_translations() {
        if ( ! function_exists( 'wp_set_script_translations' ) ) {
            return;
        }

        wp_enqueue_script( 'lazyblocks-translation', lazyblocks()->plugin_url() . 'assets/js/translation.min.js', array(), '@@plugin_version', false );
        wp_set_script_translations( 'lazyblocks-translation', '@@text_domain', lazyblocks()->plugin_path() . 'languages' );
    }

    /**
     * Admin footer text.
     *
     * @param string $text The admin footer text.
     *
     * @return string
     */
    public function admin_footer_text( $text ) {
        if ( ! function_exists( 'get_current_screen' ) ) {
            return $text;
        }

        $screen = get_current_screen();

        // Determine if the current page being viewed is "Lazy Blocks" related.
        if ( isset( $screen->post_type ) && 'lazyblocks' === $screen->post_type ) {
            // Use RegExp to append "Lazy Blocks" after the <a> element allowing translations to read correctly.
            return preg_replace( '/(<a[\S\s]+?\/a>)/', '$1 ' . esc_attr__( 'and', '@@text_domain' ) . ' <a href="https://lazyblocks.com/" target="_blank">Lazy Blocks</a>', $text, 1 );
        }

        return $text;
    }
}

new LazyBlocks_Admin();
