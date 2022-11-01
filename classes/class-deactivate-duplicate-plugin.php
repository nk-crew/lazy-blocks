<?php
/**
 * Checks if another version of Lazy Blocks/Lazy Blocks Pro is active and deactivates it.
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LazyBlocks_Deactivate_Duplicate_Plugin
 */
class LazyBlocks_Deactivate_Duplicate_Plugin {
    /**
     * LazyBlocks_Deactivate_Duplicate_Plugin constructor.
     */
    public function __construct() {
        add_action( 'activated_plugin', array( $this, 'deactivate_other_instances' ) );
        add_action( 'pre_current_active_plugins', array( $this, 'plugin_deactivated_notice' ) );
    }

    /**
     * Checks if another version of Lazy Blocks/Lazy Blocks Pro is active and deactivates it.
     * Hooked on `activated_plugin` so other plugin is deactivated when current plugin is activated.
     *
     * @param string $plugin The plugin being activated.
     */
    public function deactivate_other_instances( $plugin ) {
        if ( ! in_array( $plugin, array( 'lazy-blocks/lazy-blocks.php', 'lazy-blocks-pro/lazy-blocks-pro.php' ), true ) ) {
            return;
        }

        $plugin_to_deactivate  = 'lazy-blocks/lazy-blocks.php';
        $deactivated_notice_id = 1;

        // If we just activated the free version, deactivate the Pro version.
        if ( $plugin === $plugin_to_deactivate ) {
            $plugin_to_deactivate  = 'lazy-blocks-pro/lazy-blocks-pro.php';
            $deactivated_notice_id = 2;
        }

        if ( is_multisite() && is_network_admin() ) {
            $active_plugins = (array) get_site_option( 'active_sitewide_plugins', array() );
            $active_plugins = array_keys( $active_plugins );
        } else {
            $active_plugins = (array) get_option( 'active_plugins', array() );
        }

        foreach ( $active_plugins as $plugin_basename ) {
            if ( $plugin_to_deactivate === $plugin_basename ) {
                set_transient( 'lazy_blocks_deactivated_notice_id', $deactivated_notice_id, 1 * HOUR_IN_SECONDS );
                deactivate_plugins( $plugin_basename );
                return;
            }
        }
    }

    /**
     * Displays a notice when either Lazy Blocks or Lazy Blocks Pro is automatically deactivated.
     */
    public function plugin_deactivated_notice() {
        $deactivated_notice_id = (int) get_transient( 'lazy_blocks_deactivated_notice_id' );
        if ( ! in_array( $deactivated_notice_id, array( 1, 2 ), true ) ) {
            return;
        }

        $message = __( "Lazy Blocks and Lazy Blocks Pro should not be active at the same time. We've automatically deactivated Lazy Blocks.", 'lazy-blocks' );
        if ( 2 === $deactivated_notice_id ) {
            $message = __( "Lazy Blocks and Lazy Blocks Pro should not be active at the same time. We've automatically deactivated Lazy Blocks Pro.", 'lazy-blocks' );
        }

        ?>
        <div class="notice notice-warning">
            <p><?php echo esc_html( $message ); ?></p>
        </div>
        <?php

        delete_transient( 'lazy_blocks_deactivated_notice_id' );
    }
}

new LazyBlocks_Deactivate_Duplicate_Plugin();
