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

        // export json on get request.
        add_action( 'admin_init', array( $this, 'maybe_export_json' ) );

        // duplicate block on get request.
        add_action( 'admin_init', array( $this, 'maybe_duplicate_block' ) );

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
            esc_html__( 'Export / Import', 'lazy-blocks' ),
            esc_html__( 'Export / Import', 'lazy-blocks' ),
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
            <h1 class="wp-heading-inline"><?php echo esc_html__( 'Export / Import', 'lazy-blocks' ); ?></h1>

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
     * Clear block data to export.
     *
     * @param array $block block data.
     *
     * @return array
     */
    public function clean_block_to_export( $block ) {
        $db_blocks = lazyblocks()->blocks()->get_blocks( true );
        $controls  = lazyblocks()->controls()->get_controls();

        foreach ( $db_blocks as $db_block ) {
            if ( $db_block['id'] === $block['id'] ) {
                // Remove unused fields from controls data.
                if ( 'lazyblock/example-block' === $block['slug'] && ! empty( $block['controls'] ) ) {
                    foreach ( $block['controls'] as $k => $control ) {
                        if ( ! isset( $control['type'] ) || ! isset( $controls[ $control['type'] ] ) ) {
                            continue;
                        }

                        $control_data = $controls[ $control['type'] ];

                        // Remove restricted fields.
                        $restrictions_to_remove = array(
                            'name',
                            'label',
                            'default',
                            'placement',
                            'width',
                            'required',
                            'hide_if_not_selected',
                            'translate',
                            'save_in_meta',
                        );

                        foreach ( $restrictions_to_remove as $restriction ) {
                            if (
                                isset( $control_data['restrictions'][ $restriction . '_settings' ] )
                                && ! $control_data['restrictions'][ $restriction . '_settings' ]
                                && isset( $block['controls'][ $k ][ $restriction ] )
                            ) {
                                unset( $block['controls'][ $k ][ $restriction ] );

                                if ( 'save_in_meta' === $restriction && isset( $block['controls'][ $k ]['save_in_meta_name'] ) ) {
                                    unset( $block['controls'][ $k ]['save_in_meta_name'] );
                                }
                            }
                        }

                        // Remove default fields.
                        $default_fields_to_remove = array(
                            'default'              => '',
                            'help'                 => '',
                            'child_of'             => '',
                            'placeholder'          => '',
                            'characters_limit'     => '',
                            'width'                => '100',
                            'hide_if_not_selected' => 'false',
                            'required'             => 'false',
                            'translate'            => 'false',
                            'save_in_meta'         => 'false',
                            'save_in_meta_name'    => '',
                        );

                        foreach ( $default_fields_to_remove as $field => $val ) {
                            if ( isset( $block['controls'][ $k ][ $field ] ) && $val === $block['controls'][ $k ][ $field ] ) {
                                unset( $block['controls'][ $k ][ $field ] );

                                if ( 'save_in_meta' === $field && isset( $block['controls'][ $field ]['save_in_meta_name'] ) ) {
                                    unset( $block['controls'][ $field ]['save_in_meta_name'] );
                                }
                            }
                        }
                    }
                }

                // Remove `edit_url`.
                if ( isset( $block['edit_url'] ) ) {
                    unset( $block['edit_url'] );
                }
            }
        }

        return $block;
    }

    /**
     * Clear PHP string code.
     *
     * @param string $string code string.
     * @return string
     */
    public function clean_php_string_code( $string ) {
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
        $block = $this->clean_block_to_export( $block );

        $result = '';

        $result .= "\nlazyblocks()->add_block( ";
        // phpcs:ignore
        $result .= var_export( $block, true );
        $result .= " );\n";

        return $this->clean_php_string_code( $result );
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

        return $this->clean_php_string_code( $result );
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
            lazyblocks()->plugin_url() . 'dist/assets/admin/tools/index.min.js',
            array( 'wp-data', 'wp-element', 'wp-components', 'wp-api', 'wp-i18n' ),
            LAZY_BLOCKS_VERSION,
            true
        );

        wp_localize_script( 'lazyblocks-tools', 'lazyblocksToolsData', $data );

        wp_enqueue_style( 'lazyblocks-tools', lazyblocks()->plugin_url() . 'dist/assets/admin/tools/style.min.css', '', LAZY_BLOCKS_VERSION );
        wp_style_add_data( 'lazyblocks-tools', 'rtl', 'replace' );
        wp_style_add_data( 'lazyblocks-tools', 'suffix', '.min' );
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
            $this->add_notice( esc_html__( 'No file selected', 'lazy-blocks' ), 'warning' );
            return;
        }

        // Get file data.
        // phpcs:ignore
        $file = $_FILES['lzb_tools_import_json'];

        // Check for errors.
        if ( $file['error'] ) {
            $this->add_notice( esc_html__( 'Error uploading file. Please try again', 'lazy-blocks' ), 'warning' );
            return;
        }

        // Check file type.
        if ( pathinfo( $file['name'], PATHINFO_EXTENSION ) !== 'json' ) {
            $this->add_notice( esc_html__( 'Incorrect file type', 'lazy-blocks' ), 'warning' );
            return;
        }

        // Read JSON.
        // phpcs:ignore
        $json = file_get_contents( $file['tmp_name'] );
        $json = json_decode( $json, true );

        // Check if empty.
        if ( ! $json || ! is_array( $json ) ) {
            $this->add_notice( esc_html__( 'Import file empty', 'lazy-blocks' ), 'warning' );
            return;
        }

        $json = apply_filters( 'lzb/import_json', $json );

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
                } elseif ( isset( $data['post_types'] ) ) {
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
            $text = sprintf( esc_html( _n( 'Imported %s block', 'Imported %s blocks', $total_blocks, 'lazy-blocks' ) ), $total_blocks );

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
            $text = sprintf( esc_html( _n( 'Imported %s template', 'Imported %s templates', $total_templates, 'lazy-blocks' ) ), $total_templates );

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
     * Export JSON.
     */
    public function maybe_export_json() {
        $block_id  = filter_input( INPUT_GET, 'lazyblocks_export_block', FILTER_SANITIZE_NUMBER_INT );
        $block_ids = filter_input_array(
            INPUT_GET,
            array(
                'lazyblocks_export_blocks' => array(
                    'filter' => FILTER_SANITIZE_NUMBER_INT,
                    'flags'  => FILTER_REQUIRE_ARRAY,
                ),
            )
        );
        $block_ids = is_array( $block_ids ) && isset( $block_ids['lazyblocks_export_blocks'] ) ? $block_ids['lazyblocks_export_blocks'] : array();

        $template_ids = filter_input_array(
            INPUT_GET,
            array(
                'lazyblocks_export_templates' => array(
                    'filter' => FILTER_SANITIZE_NUMBER_INT,
                    'flags'  => FILTER_REQUIRE_ARRAY,
                ),
            )
        );
        $template_ids = is_array( $template_ids ) && isset( $template_ids['lazyblocks_export_templates'] ) ? $template_ids['lazyblocks_export_templates'] : array();

        if ( isset( $block_id ) && current_user_can( 'read_lazyblock', $block_id ) ) {
            $this->export_json( array( $block_id ) );
        } elseif ( isset( $block_ids ) && ! empty( $block_ids ) && current_user_can( 'read_lazyblock', $block_ids[0] ) ) {
            $this->export_json( $block_ids );
        } elseif ( isset( $template_ids ) && ! empty( $template_ids ) && current_user_can( 'read_lazyblock', $template_ids[0] ) ) {
            $this->export_json( $template_ids, 'templates' );
        }
    }

    /**
     * Export JSON.
     *
     * @param array  $items blocks/templates to export.
     * @param string $type export type (blocks or templates).
     */
    public function export_json( $items, $type = 'blocks' ) {
        $result = array();

        // fix string ids to int.
        foreach ( $items as $k => $id ) {
            $items[ $k ] = (int) $id;
        }

        if ( 'blocks' === $type ) {
            $blocks = lazyblocks()->blocks()->get_blocks( true );

            foreach ( $blocks as $block ) {
                if ( in_array( $block['id'], $items, true ) ) {
                    $result[] = $this->clean_block_to_export( $block );
                }
            }
        } elseif ( 'templates' === $type ) {
            $templates = lazyblocks()->templates()->get_templates( true );

            foreach ( $templates as $template ) {
                if ( in_array( $template['id'], $items, true ) ) {
                    $result[] = $template;
                }
            }
        }

        header( 'Content-Description: File Transfer' );
        header( 'Content-disposition: attachment; filename=lzb-export-' . $type . '-' . date_i18n( 'Y-m-d' ) . '.json' );
        header( 'Content-type: application/json; charset=utf-8' );
        echo wp_json_encode( $result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );

        die();
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

        // TODO - reuse this data from /controls/_base/index.php .
        $default_control_attributes = array(
            'type'                 => 'text',
            'name'                 => '',
            'default'              => '',
            'label'                => '',
            'help'                 => '',
            'child_of'             => '',
            'placement'            => 'content',
            'width'                => '100',
            'hide_if_not_selected' => 'false',
            'required'             => 'false',
            'translate'            => 'false',
            'save_in_meta'         => 'false',
            'save_in_meta_name'    => '',
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
                    } elseif ( 'keywords' === $k ) {
                        $val = implode( ',', $val );
                    } elseif ( 'controls' === $k ) {
                        $controls = array();

                        foreach ( $val as $i => $inner_val ) {
                            $controls[ $i ] = array_merge( $default_control_attributes, $inner_val );
                        }

                        $val = $controls;
                    }

                    $meta[ $meta_prefix . $k ] = $val;
                }
            }

            lazyblocks()->blocks()->save_meta_boxes( $post_id, $meta );

            do_action( 'lzb/import/block', $post_id, $data );

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
        if ( ! isset( $data['post_types'] ) || empty( $data['post_types'] ) ) {
            return false;
        }

        $templates = lazyblocks()->templates()->get_templates( true );

        // check if template already exists.
        foreach ( $templates as $template ) {
            if ( count( array_intersect( $data['post_types'], $template['post_types'] ) ) > 0 ) {
                // translators: %s - post type.
                $text = sprintf( esc_html__( 'Template for these post types \'%s\' already exists.', 'lazy-blocks' ), implode( ',', $data['post_types'] ) );
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
            add_post_meta( $post_id, '_lzb_template_blocks', rawurlencode( wp_json_encode( $data['blocks'] ) ) );
            add_post_meta( $post_id, '_lzb_template_convert_blocks_to_content', true );
            add_post_meta( $post_id, '_lzb_template_lock', $data['template_lock'] );
            add_post_meta( $post_id, '_lzb_template_post_types', $data['post_types'] );

            do_action( 'lzb/import/template', $post_id, $data );

            return $post_id;
        }

        return false;
    }

    /**
     * Maybe Duplicate Block.
     */
    public function maybe_duplicate_block() {
        $block_id          = filter_input( INPUT_GET, 'lazyblocks_duplicate_block', FILTER_SANITIZE_NUMBER_INT );
        $block_id_complete = filter_input( INPUT_GET, 'lazyblocks_duplicate_complete', FILTER_SANITIZE_NUMBER_INT );

        // Duplicate block.
        if ( isset( $block_id ) && current_user_can( 'read_lazyblock', $block_id ) ) {
            $this->duplicate_block( $block_id );
        }

        // Add notice for success duplicate.
        if ( isset( $block_id_complete ) && $block_id_complete ) {
            $post = get_post( $block_id_complete );

            if ( isset( $post ) && $post ) {
                // translators: %s - post title.
                $text = sprintf( esc_html__( 'Added new block \'%s\'.', 'lazy-blocks' ), $post->post_title );
                $this->add_notice( $text, 'success' );
            }
        }
    }

    /**
     * Duplicate Block.
     *
     * Thanks to:
     * - https://wordpress.org/plugins/duplicate-post/
     * - https://wordpress.org/plugins/duplicate-page/
     *
     * @param int $block_id block ID to duplicate.
     */
    public function duplicate_block( $block_id ) {
        // Check for nonce security.
        // phpcs:ignore
        $nonce = isset( $_GET[ 'lazyblocks_duplicate_block_nonce' ] ) ? $_GET[ 'lazyblocks_duplicate_block_nonce' ] : false;

        if ( ! $nonce || ! wp_verify_nonce( $nonce, 'lzb-duplicate-block-nonce' ) ) {
            return;
        }

        $post            = get_post( $block_id );
        $current_user    = wp_get_current_user();
        $new_post_author = $current_user->ID;

        if ( isset( $post ) && $post ) {
            // New post data array.
            $args = array(
                'comment_status' => $post->comment_status,
                'ping_status'    => $post->ping_status,
                'post_author'    => $new_post_author,
                'post_content'   => $post->post_content,
                'post_excerpt'   => $post->post_excerpt,
                'post_name'      => $post->post_name,
                'post_parent'    => $post->post_parent,
                'post_password'  => $post->post_password,
                'post_status'    => 'draft',
                'post_title'     => $post->post_title,
                'post_type'      => $post->post_type,
                'to_ping'        => $post->to_ping,
                'menu_order'     => $post->menu_order,
            );

            // Insert new post.
            $new_post_id = wp_insert_post( $args );

            // Get all current post terms ad set them to the new post draft.
            $taxonomies = get_object_taxonomies( $post->post_type );

            foreach ( $taxonomies as $taxonomy ) {
                $post_terms = wp_get_object_terms( $block_id, $taxonomy, array( 'fields' => 'slugs' ) );
                wp_set_object_terms( $new_post_id, $post_terms, $taxonomy, false );
            }

            // Duplicate all post meta.
            $post_meta_keys = get_post_custom_keys( $block_id );
            if ( ! empty( $post_meta_keys ) ) {
                // Default meta field names to be filtered out.
                $meta_exclude_list = array(
                    '_edit_lock',
                    '_edit_last',
                    '_dp_original',
                    '_dp_is_rewrite_republish_copy',
                    '_dp_has_rewrite_republish_copy',
                    '_dp_has_been_republished',
                    '_dp_creation_date_gmt',
                );

                $meta_exclude_list_string = '(' . implode( ')|(', $meta_exclude_list ) . ')';

                if ( strpos( $meta_exclude_list_string, '*' ) !== false ) {
                    $meta_exclude_list_string = str_replace( array( '*' ), array( '[a-zA-Z0-9_]*' ), $meta_exclude_list_string );

                    $meta_keys = array();
                    foreach ( $post_meta_keys as $meta_key ) {
                        if ( ! preg_match( '#^' . $meta_exclude_list_string . '$#', $meta_key ) ) {
                            $meta_keys[] = $meta_key;
                        }
                    }
                } else {
                    $meta_keys = array_diff( $post_meta_keys, $meta_exclude_list );
                }

                foreach ( $meta_keys as $meta_key ) {
                    $meta_values = get_post_custom_values( $meta_key, $post->ID );

                    // Clear existing meta data so that add_post_meta() works properly with non-unique keys.
                    delete_post_meta( $new_post_id, $meta_key );

                    foreach ( $meta_values as $meta_value ) {
                        $meta_value = maybe_unserialize( $meta_value );
                        add_post_meta( $new_post_id, $meta_key, wp_slash( $meta_value ) );
                    }
                }
            }

            // Redirect.
            wp_safe_redirect( admin_url( 'edit.php?post_type=lazyblocks&lazyblocks_duplicate_complete=' . $new_post_id ) );

            exit;
        }
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
