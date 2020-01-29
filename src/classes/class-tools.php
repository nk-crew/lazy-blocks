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
     * Admin notices
     *
     * @var array
     */
    private $notices = array();

    /**
     * LazyBlocks_Tools constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'admin_menu' ) );

        // enqueue script on Tools page.
        add_action( 'admin_footer', array( $this, 'admin_enqueue_scripts' ) );

        // add admin notices.
        add_action( 'admin_notices', array( $this, 'admin_notices' ) );
    }

    /**
     * Admin menu.
     */
    public function admin_menu() {
        $page = add_submenu_page(
            'edit.php?post_type=lazyblocks',
            esc_html__( 'Export/Import', '@@text_domain' ),
            esc_html__( 'Export/Import', '@@text_domain' ),
            'manage_options',
            'lazyblocks_tools',
            array( $this, 'render_tools_page' )
        );

        add_action( 'load-' . $page, array( $this, 'import_json' ) );
    }

    /**
     * Tools page
     */
    public function render_tools_page() {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php echo esc_html__( 'Export/Import', '@@text_domain' ); ?></h1>

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
     */
    public function admin_enqueue_scripts() {
        $screen = get_current_screen();

        if ( 'lazyblocks_page_lazyblocks_tools' !== $screen->id ) {
            return;
        }

        $blocks    = lazyblocks()->blocks()->get_blocks( true, true, true );
        $templates = lazyblocks()->templates()->get_templates( true, true );
        $data      = array(
            'blocks'    => array(),
            'templates' => array(),
            'nonce'     => wp_create_nonce( 'lzb-tools-import-nonce' ),
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

    /**
     * Import JSON.
     */
    public function import_json() {
        // Check for nonce security.
        // phpcs:ignore
        $nonce = isset( $_POST[ 'lzb_tools_import_nonce' ] ) ? $_POST[ 'lzb_tools_import_nonce' ] : false;

        if ( ! $nonce || ! wp_verify_nonce( $nonce, 'lzb-tools-import-nonce' ) ) {
            return;
        }

        // Check file size.
        if ( empty( $_FILES['lzb_tools_import_json']['size'] ) ) {
            return $this->add_notice( esc_html__( 'No file selected', '@@text_domain' ), 'warning' );
        }

        // Get file data.
        // phpcs:ignore
        $file = $_FILES['lzb_tools_import_json'];

        // Check for errors.
        if ( $file['error'] ) {
            return $this->add_notice( esc_html__( 'Error uploading file. Please try again', '@@text_domain' ), 'warning' );
        }

        // Check file type.
        if ( pathinfo( $file['name'], PATHINFO_EXTENSION ) !== 'json' ) {
            return $this->add_notice( esc_html__( 'Incorrect file type', '@@text_domain' ), 'warning' );
        }

        // Read JSON.
        // phpcs:ignore
        $json = file_get_contents( $file['tmp_name'] );
        $json = json_decode( $json, true );

        // Check if empty.
        if ( ! $json || ! is_array( $json ) ) {
            return $this->add_notice( esc_html__( 'Import file empty', '@@text_domain' ), 'warning' );
        }

        // Remember imported ids.
        $imported_blocks    = array();
        $imported_templates = array();

        // Loop over json.
        foreach ( $json as $data ) {
            if ( isset( $data['id'] ) ) {
                // check if block data.
                if ( isset( $data['icon'] ) || isset( $data['category'] ) || isset( $data['supports'] ) || isset( $data['controls'] ) ) {
                    $imported_id = $this->import_block( $data );

                    if ( $imported_id ) {
                        $imported_blocks[] = $imported_id;
                    }

                    // check if template.
                } elseif ( isset( $data['data'] ) ) {
                    $imported_id = $this->import_template( $data );

                    if ( $imported_id ) {
                        $imported_templates[] = $imported_id;
                    }
                }
            }
        }

        // imported blocks.
        if ( ! empty( $imported_blocks ) ) {
            // Count number of imported field groups.
            $total_blocks = count( $imported_blocks );

            // Generate text.
            // translators: %s - number of blocks.
            $text = sprintf( esc_html( _n( 'Imported %s block', 'Imported %s blocks', $total_blocks, '@@text_domain' ) ), $total_blocks );

            // Add links to text.
            $links = array();
            foreach ( $imported_blocks as $id ) {
                $links[] = '<a href="' . get_edit_post_link( $id ) . '">' . get_the_title( $id ) . '</a>';
            }
            $text .= ' ' . implode( ', ', $links );

            // Add notice.
            $this->add_notice( $text, 'success' );
        }

        // imported templates.
        if ( ! empty( $imported_templates ) ) {
            // Count number of imported field groups.
            $total_templates = count( $imported_templates );

            // Generate text.
            // translators: %s - number of templates.
            $text = sprintf( esc_html( _n( 'Imported %s template', 'Imported %s templates', $total_templates, '@@text_domain' ) ), $total_templates );

            // Add links to text.
            $links = array();
            foreach ( $imported_templates as $id ) {
                $links[] = '<a href="' . get_edit_post_link( $id ) . '">' . get_the_title( $id ) . '</a>';
            }
            $text .= ' ' . implode( ', ', $links );

            // Add notice.
            $this->add_notice( $text, 'success' );
        }
    }

    /**
     * Import block.
     *
     * @param array $data - new block data.
     */
    private function import_block( $data ) {
        $meta        = array();
        $meta_prefix = 'lazyblocks_';
        $post_id     = wp_insert_post(
            array(
                'post_title'  => wp_strip_all_tags( $data['title'] ),
                'post_status' => 'publish',
                'post_type'   => 'lazyblocks',
            )
        );

        if ( 0 < $post_id ) {
            // add 'lazyblocks_' prefix.
            foreach ( $data as $k => $val ) {
                if ( ( 'code' === $k || 'supports' === $k ) && is_array( $val ) ) {
                    foreach ( $val as $i => $inner_val ) {
                        $meta[ $meta_prefix . $k . '_' . $i ] = $inner_val;
                    }
                } else {
                    if ( 'slug' === $k ) {
                        $val = substr( $val, strpos( $val, '/' ) + 1 );
                    }

                    $meta[ $meta_prefix . $k ] = $val;
                }
            }

            lazyblocks()->blocks()->save_meta_boxes( $post_id, $meta );

            do_action( 'lzb_import_block', $post_id, $data );

            return $post_id;
        }

        return false;
    }

    /**
     * Import template.
     *
     * @param array $data - new template data.
     */
    private function import_template( $data ) {
        if ( ! isset( $data['post_type'] ) ) {
            return false;
        }

        $templates = lazyblocks()->templates()->get_templates( true );

        // check if template already exists.
        foreach ( $templates as $template ) {
            if ( $template['post_type']['data']['post_type'] === $data['post_type'] ) {
                // translators: %s - post type.
                $text = sprintf( esc_html__( 'Template for post type \'%s\' already exists.', '@@text_domain' ), $data['post_type'] );
                $this->add_notice( $text, 'warning' );
                return false;
            }
        }

        $post_id = wp_insert_post(
            array(
                'post_title'  => wp_strip_all_tags( $data['title'] ),
                'post_status' => 'publish',
                'post_type'   => 'lazyblocks_templates',
            )
        );

        if ( 0 < $post_id ) {
            $template_data = isset( $data['data'] ) && ! empty( $data['data'] ) ? $data['data'] : array();

            // phpcs:ignore
            add_post_meta( $post_id, 'lzb_template_data', urlencode( json_encode( $template_data ) ) );

            do_action( 'lzb_import_template', $post_id, $template_data );

            return $post_id;
        }

        return false;
    }

    /**
     * Add notice
     *
     * @param string $text - notice text.
     * @param string $type - notice type [success, warning, error, info].
     * @return void
     */
    private function add_notice( $text, $type ) {
        $this->notices[] = array(
            'text' => $text,
            'type' => $type,
        );
    }

    /**
     * Add admin notices if available
     */
    public function admin_notices() {
        if ( ! empty( $this->notices ) ) {
            foreach ( $this->notices as $notice ) {
                ?>
                <div class="notice notice-<?php echo esc_attr( $notice['type'] ); ?> is-dismissible">
                    <p><?php echo wp_kses_post( $notice['text'] ); ?></p>
                </div>
                <?php
            }
        }
    }
}
