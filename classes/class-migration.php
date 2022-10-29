<?php
/**
 * Migrations
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_Migration
 */
class LazyBlocks_Migration {
    /**
     * Initial version.
     *
     * @var string
     */
    protected $initial_version = '2.0.10';

    /**
     * LazyBlocks_Extend constructor.
     */
    public function __construct() {
        if ( is_admin() ) {
            add_action( 'admin_init', array( $this, 'init' ), 3 );
        } else {
            add_action( 'wp', array( $this, 'init' ), 3 );
        }
    }

    /**
     * Init.
     */
    public function init() {
        // Migration code added after `$this->initial_version` plugin version.
        $saved_version   = get_option( 'lzb_db_version', $this->initial_version );
        $current_version = LAZY_BLOCKS_VERSION;

        foreach ( $this->get_migrations() as $migration ) {
            if ( version_compare( $saved_version, $migration['version'], '<' ) ) {
                call_user_func( $migration['cb'] );
            }
        }

        if ( version_compare( $saved_version, $current_version, '<' ) ) {
            update_option( 'lzb_db_version', $current_version );
        }
    }

    /**
     * Get all available migrations.
     *
     * @return array
     */
    public function get_migrations() {
        return array(
            array(
                'version' => '2.5.0',
                'cb'      => array( $this, 'v_2_5_0' ),
            ),
            array(
                'version' => '2.1.0',
                'cb'      => array( $this, 'v_2_1_0' ),
            ),
        );
    }

    /**
     * Convert old templates to new one.
     */
    public function v_2_5_0() {
        // get all lazyblocks_templates post types.
        // Don't use WP_Query on the admin side https://core.trac.wordpress.org/ticket/18408 .
        $templates = get_posts(
            array(
                'post_type'      => 'lazyblocks_templates',
                // phpcs:ignore
                'posts_per_page' => -1,
                'showposts'      => -1,
                'paged'          => -1,
            )
        );

        if ( $templates ) {
            foreach ( $templates as $template ) {
                $data = get_post_meta( $template->ID, 'lzb_template_data', true );

                if ( ! $data ) {
                    continue;
                }

                $data = (array) json_decode( urldecode( $data ), true );

                if ( isset( $data['blocks'] ) && is_array( $data['blocks'] ) ) {
                    $result_blocks = array();

                    foreach ( $data['blocks'] as $block ) {
                        $result_blocks[] = array( $block['name'] );
                    }

                    update_post_meta( $template->ID, '_lzb_template_blocks', rawurlencode( wp_json_encode( $result_blocks ) ) );
                    update_post_meta( $template->ID, '_lzb_template_convert_blocks_to_content', true );
                }

                update_post_meta( $template->ID, '_lzb_template_lock', $data['template_lock'] );
                update_post_meta( $template->ID, '_lzb_template_post_types', array( $data['post_type'] ) );

                delete_post_meta( $template->ID, 'lzb_template_data' );
            }

            wp_reset_postdata();
        }
    }

    /**
     * Remove deprecated 'code_use_php' option and add new one 'code_output_method' to lazyblocks post type.
     */
    public function v_2_1_0() {
        // Get all available lazyblocks.
        // Don't use WP_Query on the admin side https://core.trac.wordpress.org/ticket/18408.
        $lzb_query = get_posts(
            array(
                'post_type'      => 'lazyblocks',
                'posts_per_page' => -1,
                'showposts'      => -1,
                'paged'          => -1,
            )
        );

        if ( $lzb_query ) {
            foreach ( $lzb_query as $post ) {
                $use_php = get_post_meta( $post->ID, 'lazyblocks_code_use_php', true );

                if ( 'true' === $use_php || 'false' === $use_php ) {
                    update_post_meta( $post->ID, 'lazyblocks_code_use_php', 'deprecated' );
                    update_post_meta( $post->ID, 'lazyblocks_code_output_method', 'true' === $use_php ? 'php' : 'html' );
                }
            }
            wp_reset_postdata();
        }
    }
}

new LazyBlocks_Migration();
