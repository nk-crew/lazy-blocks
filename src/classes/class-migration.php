<?php
/**
 * Migrations
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_Migration
 */
class LazyBlocks_Migration {
    /**
     * The version.
     *
     * @var string
     */
    protected $version = '@@plugin_version';

    /**
     * Initial version.
     *
     * @var string
     */
    protected $initial_version = '';

    /**
     * The theme version as stored in the db.
     *
     * @var string
     */
    protected $previous_version;

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
        // Migration code added after 2.0.10 plugin version.
        $saved_version   = get_option( 'lzb_db_version', '2.0.10' );
        $current_version = $this->version;

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
                'version' => '2.1.0',
                'cb'      => array( $this, 'v_2_1_0' ),
            ),
        );
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
