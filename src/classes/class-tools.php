<?php
/**
 * LazyBlocks tools.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Tools class. Class to work with LazyBlocks CPT.
 */
class LazyBlocks_Tools {
    /**
     * LazyBlocks_Tools constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'admin_menu' ) );

        // enqueue script on Tools page.
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
    }

    /**
     * Admin menu.
     */
    public function admin_menu() {
        add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'Tools', '@@text_domain' ),
            esc_html__( 'Tools', '@@text_domain' ),
            'manage_options',
            'lazyblocks_tools',
            array( $this, 'render_tools_page' )
        );
    }

    /**
     * Tools page
     */
    public function render_tools_page() {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php echo esc_html__( 'Tools', '@@text_domain' ); ?></h1>

            <div id="poststuff">
                <div class="lazyblocks-tools-page">
                    <span class="spinner is-active"></span>
                </div>
            </div>
            <style type="text/css">
                .lazyblocks-tools-page > .spinner {
                    float: left;
                    margin-left: 0;
                }
            </style>
        </div>
        <?php
    }

    /**
     * Clear PHP string code.
     *
     * @param string $string code string.
     * @return string
     */
    public function clear_php_string_code( $string ) {
        $str_replace  = array(
            '  '      => '    ',
            'array (' => 'array(',
        );
        $preg_replace = array(
            '/([ \r\n]+?)array/' => ' array',
            '/[0-9]+ => array/'  => 'array',
            '/\n/'               => "\n    ",
        );

        // change 2-spaces to 4-spaces.
        $string = str_replace( array_keys( $str_replace ), array_values( $str_replace ), $string );

        // correct formats '=> array('.
        // additional spaces.
        $string = preg_replace( array_keys( $preg_replace ), array_values( $preg_replace ), $string );

        return $string;
    }

    /**
     * Get block PHP string code.
     *
     * @param array $block block data.
     * @return string
     */
    public function get_block_php_string_code( $block ) {
        $result = '';

        $result .= "\nlazyblocks()->add_block( ";
        // phpcs:ignore
        $result .= var_export( $block, true );
        $result .= " );\n";

        return $this->clear_php_string_code( $result );
    }

    /**
     * Get template PHP string code.
     *
     * @param array $template template data.
     * @return string
     */
    public function get_template_php_string_code( $template ) {
        $result = '';

        $result .= "\nlazyblocks()->add_template( ";
        // phpcs:ignore
        $result .= var_export( $template, true );
        $result .= " );\n";

        return $this->clear_php_string_code( $result );
    }

    /**
     * Enqueue script for Tools page.
     *
     * @param string $page_data Current page name.
     */
    public function admin_enqueue_scripts( $page_data ) {
        if ( 'lazyblocks_page_lazyblocks_tools' !== $page_data ) {
            return;
        }

        $blocks    = lazyblocks()->blocks()->get_blocks( true );
        $templates = lazyblocks()->templates()->get_templates( true );
        $data      = array(
            'blocks'    => array(),
            'templates' => array(),
        );

        if ( ! empty( $blocks ) ) {
            foreach ( $blocks as $block ) {
                $data['blocks'][] = array(
                    'data'            => $block,
                    'php_string_code' => $this->get_block_php_string_code( $block ),
                );
            }
        }
        if ( ! empty( $templates ) ) {
            foreach ( $templates as $template ) {
                $data['templates'][] = array(
                    'data'            => $template,
                    'php_string_code' => $this->get_template_php_string_code( $template ),
                );
            }
        }

        // Lazyblocks Tools.
        wp_enqueue_script(
            'lazyblocks-tools',
            lazyblocks()->plugin_url . 'assets/admin/tools/index.min.js',
            array( 'wp-data', 'wp-element', 'wp-components', 'wp-api', 'wp-i18n' ),
            '@@plugin_version',
            true
        );

        wp_localize_script( 'lazyblocks-tools', 'lazyblocksToolsData', $data );
    }
}
