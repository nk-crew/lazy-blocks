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
        $blocks = lazyblocks()->blocks()->get_blocks( true );
        $templates = lazyblocks()->templates()->get_templates( true );
        $blocks_string = '';
        $templates_string = '';

        $str_replace = array(
            '  '      => '    ',
            'array (' => 'array(',
        );
        $preg_replace = array(
            '/([ \r\n]+?)array/' => ' array',
            '/[0-9]+ => array/'  => 'array',
            '/\n/'               => "\n    ",
        );

        if ( ! empty( $blocks ) ) {
            foreach ( $blocks as $block ) {
                $blocks_string .= "\nlazyblocks()->add_block( ";
                $blocks_string .= var_export( $block, true );
                $blocks_string .= " );\n";
            }

            // change 2-spaces to 4-spaces.
            $blocks_string = str_replace( array_keys( $str_replace ), array_values( $str_replace ), $blocks_string );

            // correct formats '=> array('.
            // additional spaces.
            $blocks_string = preg_replace( array_keys( $preg_replace ), array_values( $preg_replace ), $blocks_string );

            $blocks_string = "if ( function_exists( 'lazyblocks' ) ) :\n$blocks_string\nendif;";
        }
        if ( ! empty( $templates ) ) {
            foreach ( $templates as $template ) {
                $templates_string .= "\nlazyblocks()->add_template( ";
                $templates_string .= var_export( $template, true );
                $templates_string .= " );\n";
            }

            // change 2-spaces to 4-spaces.
            $templates_string = str_replace( array_keys( $str_replace ), array_values( $str_replace ), $templates_string );

            // correct formats '=> array('.
            // additional spaces.
            $templates_string = preg_replace( array_keys( $preg_replace ), array_values( $preg_replace ), $templates_string );

            $templates_string = "if ( function_exists( 'lazyblocks' ) ) :\n$templates_string\nendif;";
        }

        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php echo esc_html__( 'Tools', '@@text_domain' ); ?></h1>

            <div id="poststuff">
                <div id="lazyblocks_tools" class="postbox">
                    <button type="button" class="handlediv" aria-expanded="true"><span class="screen-reader-text"><?php echo esc_html__( 'Toggle panel: Export', '@@text_domain' ); ?></span><span class="toggle-indicator" aria-hidden="true"></span></button><h2 class="hndle ui-sortable-handle"><span><?php echo esc_html__( 'Export', '@@text_domain' ); ?></span></h2>
                    <div class="inside">
                        <p><?php echo esc_html__( 'You can export PHP code and use it in the theme/plugin to register a local version of generated blocks and templates. A local field group can provide many benefits such as faster load times, version control & dynamic blocks/templates. Simply copy and paste the following code to your theme\'s functions.php file or include it within an external file.', '@@text_domain' ); ?></p>

                        <div class="lzb-export-textarea">
                            <div>
                                <label for="lzb-export-blocks">Blocks</label>
                                <textarea class="lzb-export-code" id="lzb-export-blocks" readonly><?php echo esc_textarea( $blocks_string ); ?></textarea>
                            </div>
                            <div>
                                <label for="lzb-export-templates">Templates</label>
                                <textarea class="lzb-export-code" id="lzb-export-templates" readonly><?php echo esc_textarea( $templates_string ); ?></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
