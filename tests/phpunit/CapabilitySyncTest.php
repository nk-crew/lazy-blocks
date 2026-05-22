<?php
/**
 * Tests for Lazy Blocks role capability synchronization lifecycle.
 */
class CapabilitySyncTest extends WP_UnitTestCase {
	/**
	 * Original lzb_db_version option value.
	 *
	 * @var string
	 */
	private $original_db_version = '__missing__';

	/**
	 * Original role capability state before each test.
	 *
	 * @var array
	 */
	private $original_role_caps = array();

	/**
	 * Capability matrix expected for Lazy Blocks roles.
	 *
	 * @return array
	 */
	private function get_role_capability_matrix() {
		return array(
			'administrator' => array(
				'edit_lazyblock',
				'edit_lazyblocks',
				'edit_other_lazyblocks',
				'publish_lazyblocks',
				'read_lazyblock',
				'read_private_lazyblocks',
				'delete_lazyblocks',
				'delete_lazyblock',
			),
			'editor'        => array(
				'read_lazyblock',
				'read_private_lazyblocks',
			),
			'author'        => array(
				'read_lazyblock',
				'read_private_lazyblocks',
			),
			'contributor'   => array(
				'read_lazyblock',
				'read_private_lazyblocks',
			),
		);
	}

	/**
	 * Capture the current role capability state so tests can restore it.
	 */
	private function capture_role_capabilities() {
		foreach ( $this->get_role_capability_matrix() as $role_name => $caps ) {
			$role = get_role( $role_name );

			if ( ! $role ) {
				continue;
			}

			foreach ( $caps as $capability ) {
				$this->original_role_caps[ $role_name ][ $capability ] = $role->has_cap( $capability );
			}
		}
	}

	/**
	 * Restore the role capability state captured before each test.
	 */
	private function restore_role_capabilities() {
		foreach ( $this->original_role_caps as $role_name => $caps ) {
			$role = get_role( $role_name );

			if ( ! $role ) {
				continue;
			}

			foreach ( $caps as $capability => $has_capability ) {
				if ( $has_capability ) {
					$role->add_cap( $capability );
				} else {
					$role->remove_cap( $capability );
				}
			}
		}
	}

	/**
	 * Remove the Lazy Blocks capabilities from all affected roles.
	 */
	private function remove_lazyblocks_capabilities() {
		foreach ( $this->get_role_capability_matrix() as $role_name => $caps ) {
			$role = get_role( $role_name );

			if ( ! $role ) {
				continue;
			}

			foreach ( $caps as $capability ) {
				$role->remove_cap( $capability );
			}
		}
	}

	/**
	 * Assert the expected Lazy Blocks capability matrix is applied.
	 */
	private function assert_lazyblocks_capability_matrix_applied() {
		foreach ( $this->get_role_capability_matrix() as $role_name => $caps ) {
			$role = get_role( $role_name );

			$this->assertNotNull( $role, sprintf( 'Role %s should exist.', $role_name ) );

			foreach ( $caps as $capability ) {
				$this->assertTrue(
					$role->has_cap( $capability ),
					sprintf( 'Role %s should have capability %s.', $role_name, $capability )
				);
			}
		}
	}

	/**
	 * Get a migration instance without registering its constructor hooks.
	 *
	 * @return LazyBlocks_Migration
	 */
	private function create_migration_instance() {
		$reflection = new ReflectionClass( 'LazyBlocks_Migration' );

		return $reflection->newInstanceWithoutConstructor();
	}

	/**
	 * Set up test state.
	 */
	protected function setUp(): void {
		parent::setUp();

		$this->original_db_version = get_option( 'lzb_db_version', '__missing__' );
		$this->capture_role_capabilities();
	}

	/**
	 * Restore test state.
	 */
	protected function tearDown(): void {
		$this->restore_role_capabilities();

		if ( '__missing__' === $this->original_db_version ) {
			delete_option( 'lzb_db_version' );
		} else {
			update_option( 'lzb_db_version', $this->original_db_version );
		}

		parent::tearDown();
	}

	/**
	 * Capabilities should not be synchronized via admin_init.
	 */
	public function test_role_caps_are_not_synced_on_admin_init() {
		$this->assertFalse(
			has_action( 'admin_init', array( lazyblocks()->blocks(), 'add_role_caps' ) ),
			'Role capability sync should not be hooked to admin_init.'
		);
	}

	/**
	 * Existing installs should receive capabilities through the migration path.
	 */
	public function test_migration_syncs_role_caps_for_existing_installs() {
		$this->remove_lazyblocks_capabilities();
		update_option( 'lzb_db_version', '4.2.9' );

		$migration = $this->create_migration_instance();
		$migration->init();

		$this->assert_lazyblocks_capability_matrix_applied();
		$this->assertSame( LAZY_BLOCKS_VERSION, get_option( 'lzb_db_version' ) );
	}

	/**
	 * Fresh installs should receive capabilities when migrations run for the first time.
	 */
	public function test_migration_syncs_role_caps_for_fresh_installs() {
		$this->remove_lazyblocks_capabilities();
		delete_option( 'lzb_db_version' );

		$migration = $this->create_migration_instance();
		$migration->init();

		$this->assert_lazyblocks_capability_matrix_applied();
		$this->assertSame( LAZY_BLOCKS_VERSION, get_option( 'lzb_db_version' ) );
	}
}
