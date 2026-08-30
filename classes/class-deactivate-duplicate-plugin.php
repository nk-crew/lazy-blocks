<?php
/**
 * Deactivates a copy of Lazy Blocks that cannot run next to Lazy Blocks Pro.
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
	 * Basename of the free plugin.
	 */
	const FREE_PLUGIN = 'lazy-blocks/lazy-blocks.php';

	/**
	 * Basename of the Pro plugin.
	 */
	const PRO_PLUGIN = 'lazy-blocks-pro/lazy-blocks-pro.php';

	/**
	 * First version of the free plugin that steps aside on its own when the Pro plugin
	 * is active. Older ones declare the core class a second time instead, so they cannot
	 * stay active next to it.
	 *
	 * `version_compare()` ranks a pre-release below the release it precedes, so the
	 * `-alpha` suffix is what lets a beta or an RC of that version through.
	 */
	const FREE_PLUGIN_MIN_VERSION = '4.4.1-alpha';

	/**
	 * LazyBlocks_Deactivate_Duplicate_Plugin constructor.
	 */
	public function __construct() {
		add_action( 'activated_plugin', array( $this, 'deactivate_outdated_free_plugin' ) );
		add_action( 'pre_current_active_plugins', array( $this, 'plugin_deactivated_notice' ) );
	}

	/**
	 * Deactivates the free plugin when the Pro plugin is active and the free copy is too
	 * old to step aside by itself. Hooked on `activated_plugin`, so it runs whichever of
	 * the two was just switched on.
	 *
	 * @param string $plugin The plugin being activated.
	 */
	public function deactivate_outdated_free_plugin( $plugin ) {
		if ( ! in_array( $plugin, array( self::FREE_PLUGIN, self::PRO_PLUGIN ), true ) ) {
			return;
		}

		$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() ) {
			$active_plugins = array_merge(
				$active_plugins,
				array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) )
			);
		}

		if (
			! in_array( self::FREE_PLUGIN, $active_plugins, true ) ||
			! in_array( self::PRO_PLUGIN, $active_plugins, true )
		) {
			return;
		}

		$free_plugin_file = WP_PLUGIN_DIR . '/' . self::FREE_PLUGIN;

		// `active_plugins` keeps naming a plugin whose directory was removed by hand,
		// and `get_plugin_data()` reads the file without checking that it is there.
		if ( ! file_exists( $free_plugin_file ) ) {
			return;
		}

		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$free_plugin_data = get_plugin_data( $free_plugin_file, false, false );

		if (
			empty( $free_plugin_data['Version'] ) ||
			version_compare( $free_plugin_data['Version'], self::FREE_PLUGIN_MIN_VERSION, '>=' )
		) {
			return;
		}

		set_transient( 'lazy_blocks_deactivated_notice_id', 1, 1 * HOUR_IN_SECONDS );

		deactivate_plugins( self::FREE_PLUGIN );
	}

	/**
	 * Displays a notice when Lazy Blocks is automatically deactivated.
	 */
	public function plugin_deactivated_notice() {
		if ( 1 !== (int) get_transient( 'lazy_blocks_deactivated_notice_id' ) ) {
			return;
		}

		?>
		<div class="notice notice-warning">
			<p>
				<?php
				esc_html_e(
					"This version of Lazy Blocks is too old to run next to Lazy Blocks Pro. We've automatically deactivated Lazy Blocks.",
					'lazy-blocks'
				);
				?>
			</p>
		</div>
		<?php

		delete_transient( 'lazy_blocks_deactivated_notice_id' );
	}
}

new LazyBlocks_Deactivate_Duplicate_Plugin();
