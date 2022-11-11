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
        add_action( 'admin_menu', array( $this, 'admin_menu' ), 11 );
        add_action( 'admin_menu', array( $this, 'maybe_hide_menu_item' ), 12 );

        // Add Pro link to plugins page and menu.
        add_filter( 'plugin_action_links_' . lazyblocks()->plugin_basename(), array( $this, 'add_go_pro_link_plugins_page' ) );

        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'constructor_enqueue_scripts' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_script_translations' ), 9 );

        add_action( 'in_admin_header', array( $this, 'in_admin_header' ) );
        add_filter( 'admin_footer_text', array( $this, 'admin_footer_text' ) );
    }

    /**
     * Admin menu.
     */
    public function admin_menu() {
        // Documentation menu link.
        add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'Documentation', 'lazy-blocks' ),
            esc_html__( 'Documentation', 'lazy-blocks' ),
            'manage_options',
            lazyblocks()->get_plugin_site_url(
                array(
                    'sub_path'     => 'docs/overview/',
                    'utm_campaign' => 'docs',
                )
            )
        );

        // Go Pro link.
        if ( ! lazyblocks()->is_pro() ) {
            add_submenu_page(
                'edit.php?post_type=lazyblocks',
                '',
                '<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . esc_html__( 'Go Pro', 'lazy-blocks' ),
                'manage_options',
                lazyblocks()->get_plugin_site_url()
            );
        }
    }

    /**
     * Add Go Pro link to plugins page.
     *
     * @param Array $links - available links.
     *
     * @return array
     */
    public function add_go_pro_link_plugins_page( $links ) {
        if ( lazyblocks()->is_pro() ) {
            return $links;
        }

        return array_merge(
            $links,
            array(
                '<a target="_blank" href="' . lazyblocks()->get_plugin_site_url( array( 'utm_medium' => 'plugins_list' ) ) . '">' . esc_html__( 'Go Pro', 'lazy-blocks' ) . '</a>',
            )
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

        wp_enqueue_script( 'date_i18n', lazyblocks()->plugin_url() . 'vendors/date_i18n/date_i18n.js', array(), '1.0.0', true );

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

        wp_enqueue_style( 'lazyblocks-admin', lazyblocks()->plugin_url() . 'dist/assets/admin/style.min.css', array(), LAZY_BLOCKS_VERSION );
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
                lazyblocks()->plugin_url() . 'dist/assets/editor-constructor/index.min.js',
                array( 'wp-blocks', 'wp-editor', 'wp-block-editor', 'wp-i18n', 'wp-element', 'wp-components', 'lodash', 'jquery' ),
                LAZY_BLOCKS_VERSION,
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
                    'plugin_version'      => LAZY_BLOCKS_VERSION,
                    'is_pro'              => lazyblocks()->is_pro(),
                    'pro_url'             => lazyblocks()->get_plugin_site_url( array( 'utm_medium' => 'constructor' ) ),
                )
            );

            wp_enqueue_style( 'lazyblocks-constructor', lazyblocks()->plugin_url() . 'dist/assets/editor-constructor/style.min.css', array(), LAZY_BLOCKS_VERSION );
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

        wp_enqueue_script( 'lazyblocks-translation', lazyblocks()->plugin_url() . 'dist/assets/editor/translation.min.js', array(), LAZY_BLOCKS_VERSION, false );
        wp_set_script_translations( 'lazyblocks-translation', 'lazy-blocks', lazyblocks()->plugin_path() . 'languages' );
    }

    /**
     * Admin navigation.
     */
    public function in_admin_header() {
        if ( ! function_exists( 'get_current_screen' ) ) {
            return;
        }

        $screen = get_current_screen();

        // Determine if the current page being viewed is "Lazy Blocks" related.
        if (
            ! isset( $screen->post_type ) ||
            'lazyblocks' !== $screen->post_type ||
            ( isset( $screen->is_block_editor ) && $screen->is_block_editor() )
        ) {
            return;
        }

        global $submenu, $submenu_file, $plugin_page;

        $parent_slug = 'edit.php?post_type=lazyblocks';
        $tabs        = array();

        // Generate array of navigation items.
        if ( isset( $submenu[ $parent_slug ] ) ) {
            foreach ( $submenu[ $parent_slug ] as $i => $sub_item ) {

                // Check user can access page.
                if ( ! current_user_can( $sub_item[1] ) ) {
                    continue;
                }

                // Ignore "Add New".
                if ( 'post-new.php?post_type=lazyblocks' === $sub_item[2] ) {
                    continue;
                }

                // Define tab.
                $tab = array(
                    'text' => $sub_item[0],
                    'url'  => $sub_item[2],
                );

                // Convert submenu slug "test" to "$parent_slug&page=test".
                if ( ! strpos( $sub_item[2], '.php' ) && 0 !== strpos( $sub_item[2], 'https://' ) ) {
                    $tab['url'] = add_query_arg( array( 'page' => $sub_item[2] ), $parent_slug );
                }

                // Detect active state.
                if ( $submenu_file === $sub_item[2] || $plugin_page === $sub_item[2] ) {
                    $tab['is_active'] = true;
                }

                // Special case for "Add New" page.
                if ( 0 === $i && 'post-new.php?post_type=lazyblocks' === $submenu_file ) {
                    $tab['is_active'] = true;
                }

                $tabs[] = $tab;
            }
        }

        // Bail early if set to false.
        if ( false === $tabs ) {
            return;
        }

        // phpcs:ignore
        $logo_url = 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( lazyblocks()->plugin_path() . 'assets/svg/icon-lazyblocks-black.svg' ) );

        ?>
        <div class="lzb-admin-toolbar">
            <h2>
                <img src="<?php echo $logo_url; // phpcs:ignore ?>" width="20" height="20">
                <?php echo esc_html__( 'Lazy Blocks', 'lazy-blocks' ); ?>
            </h2>
            <?php
            foreach ( $tabs as $tab ) {
                printf(
                    '<a class="lzb-admin-toolbar-tab%s" href="%s">%s</a>',
                    ! empty( $tab['is_active'] ) ? ' is-active' : '',
                    esc_url( $tab['url'] ),
                    // phpcs:ignore
                    $tab['text']
                );
            }
            ?>
        </div>
        <?php
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
            return preg_replace( '/(<a[\S\s]+?\/a>)/', '$1 ' . esc_attr__( 'and', 'lazy-blocks' ) . ' <a href="https://www.lazyblocks.com/?utm_source=plugin&utm_medium=admin_footer&utm_campaign=link&utm_content=' . LAZY_BLOCKS_VERSION . '" target="_blank">Lazy Blocks</a>', $text, 1 );
        }

        return $text;
    }
}

new LazyBlocks_Admin();
