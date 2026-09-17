<?php
/**
 * Blocks stored in the database: how they reach get_blocks(), the transient that caches them,
 * and what invalidates it.
 */
class BlockCacheTest extends WP_UnitTestCase {
	/**
	 * Block types a test registered, and user blocks it added, removed in tear_down().
	 *
	 * @var array
	 */
	private $registered_blocks = array();

	public function set_up() {
		parent::set_up();

		// Saving block code needs unfiltered_html.
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		lazyblocks()->blocks()->clear_blocks_cache();
	}

	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();

		foreach ( $this->registered_blocks as $block_slug ) {
			if ( $registry->is_registered( $block_slug ) ) {
				$registry->unregister( $block_slug );
			}

			lazyblocks()->blocks()->remove_block( $block_slug );
		}
		$this->registered_blocks = array();

		lazyblocks()->blocks()->clear_blocks_cache();

		parent::tear_down();
	}

	/**
	 * Create a block post the way the block builder REST endpoint does.
	 *
	 * @param string $slug block slug without namespace.
	 * @param array  $meta extra lazyblocks_* meta.
	 *
	 * @return int post id.
	 */
	private function create_db_block( $slug, $meta = array() ) {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_status' => 'publish',
				'post_title'  => 'Block ' . $slug,
			)
		);

		lazyblocks()->blocks()->save_meta_boxes(
			$post_id,
			array_merge(
				array(
					'lazyblocks_slug'               => $slug,
					'lazyblocks_code_frontend_html' => '<p>' . $slug . '</p>',
				),
				$meta
			)
		);
		lazyblocks()->blocks()->clear_blocks_cache();

		return $post_id;
	}

	/**
	 * The transient key of the current blocks cache.
	 *
	 * @return string
	 */
	private function cache_key() {
		$method = new ReflectionMethod( 'LazyBlocks_Blocks', 'get_cache_key' );
		$method->setAccessible( true );

		return $method->invoke( lazyblocks()->blocks() );
	}

	/**
	 * Drop what this PHP process remembers about blocks, as a new request would.
	 *
	 * @param bool $cache_hash also forget the cache key hash.
	 */
	private function forget_request_state( $cache_hash = false ) {
		$blocks = lazyblocks()->blocks();

		foreach ( array( 'blocks' => null, 'blocks_result_cache' => array() ) as $name => $value ) {
			$property = new ReflectionProperty( 'LazyBlocks_Blocks', $name );
			$property->setAccessible( true );
			$property->setValue( $blocks, $value );
		}

		if ( $cache_hash ) {
			$property = new ReflectionProperty( 'LazyBlocks_Blocks', 'cache_hash' );
			$property->setAccessible( true );
			$property->setValue( null, null );
		}
	}

	public function test_db_block_is_marshaled_with_controls_and_code() {
		$this->create_db_block(
			'db-block',
			array(
				'lazyblocks_description' => 'From the database',
				'lazyblocks_controls'    => array(
					'control_a' => array(
						'type'      => 'text',
						'name'      => 'message',
						'label'     => 'Message',
						'placement' => 'content',
						'default'   => 'hi',
					),
				),
			)
		);

		$block = lazyblocks()->blocks()->get_block( 'lazyblock/db-block' );

		$this->assertSame( 'Block db-block', $block['title'] );
		$this->assertSame( 'From the database', $block['description'] );
		$this->assertSame( '<p>db-block</p>', $block['code']['frontend_html'] );
		$this->assertSame( 'message', $block['controls']['control_a']['name'] );
		$this->assertSame( 'hi', $block['controls']['control_a']['default'] );
		// Control defaults are filled in for keys the builder did not save.
		$this->assertSame( 'false', $block['controls']['control_a']['save_in_meta'] );
	}

	public function test_db_blocks_are_served_from_the_transient() {
		$this->create_db_block( 'cached' );

		lazyblocks()->blocks()->get_blocks();

		$cached = get_transient( $this->cache_key() );
		$this->assertSame( 'lazyblock/cached', $cached[0]['slug'] );

		// A changed transient is what the next request sees, not the database.
		$cached[0]['title'] = 'From transient';
		set_transient( $this->cache_key(), $cached, DAY_IN_SECONDS );
		$this->forget_request_state();

		$this->assertSame( 'From transient', lazyblocks()->blocks()->get_block( 'lazyblock/cached' )['title'] );
	}

	public function test_saving_a_block_post_clears_the_transient() {
		$post_id = $this->create_db_block( 'saved' );

		lazyblocks()->blocks()->get_blocks();
		$this->assertNotFalse( get_transient( $this->cache_key() ) );

		wp_update_post(
			array(
				'ID'         => $post_id,
				'post_title' => 'Renamed',
			)
		);

		$this->assertFalse( get_transient( $this->cache_key() ) );
		$this->assertSame( 'Renamed', lazyblocks()->blocks()->get_block( 'lazyblock/saved' )['title'] );
	}

	public function test_trashing_and_restoring_a_block_post_updates_the_list() {
		$post_id = $this->create_db_block( 'trashed' );

		$this->assertNotNull( lazyblocks()->blocks()->get_block( 'lazyblock/trashed' ) );

		wp_trash_post( $post_id );
		$this->assertNull( lazyblocks()->blocks()->get_block( 'lazyblock/trashed' ) );

		wp_untrash_post( $post_id );
		wp_publish_post( $post_id );
		$this->assertNotNull( lazyblocks()->blocks()->get_block( 'lazyblock/trashed' ) );
	}

	public function test_cache_key_changes_when_registered_controls_change() {
		$this->create_db_block( 'keyed' );

		lazyblocks()->blocks()->get_blocks();
		$old_key = $this->cache_key();

		// A stale transient under the old key must not be read once a control type appears.
		$stale             = get_transient( $old_key );
		$stale[0]['title'] = 'Stale';
		set_transient( $old_key, $stale, DAY_IN_SECONDS );

		$add_control = function ( $controls ) {
			$controls['cache_test_control'] = array( 'type' => 'string' );
			return $controls;
		};
		add_filter( 'lzb/controls/all', $add_control );
		$this->forget_request_state( true );

		$new_key = $this->cache_key();
		$title   = lazyblocks()->blocks()->get_block( 'lazyblock/keyed' )['title'];

		remove_filter( 'lzb/controls/all', $add_control );

		$this->assertNotSame( $old_key, $new_key );
		$this->assertSame( 'Block keyed', $title );
	}

	public function test_clear_blocks_cache_removes_every_cache_transient() {
		global $wpdb;

		$this->create_db_block( 'cleared' );
		lazyblocks()->blocks()->get_blocks();
		set_transient( LazyBlocks_Blocks::BLOCKS_CACHE_KEY_PREFIX . 'orphan', array(), DAY_IN_SECONDS );

		lazyblocks()->blocks()->clear_blocks_cache();

		$this->assertSame(
			array(),
			$wpdb->get_col(
				$wpdb->prepare(
					"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
					$wpdb->esc_like( '_transient_' . LazyBlocks_Blocks::BLOCKS_CACHE_KEY_PREFIX ) . '%'
				)
			)
		);
	}

	public function test_zero_cache_expiration_disables_the_transient() {
		$this->create_db_block( 'uncached' );

		add_filter( 'lzb/cache_expiration', '__return_zero' );
		$block = lazyblocks()->blocks()->get_block( 'lazyblock/uncached' );
		remove_filter( 'lzb/cache_expiration', '__return_zero' );

		$this->assertSame( 'lazyblock/uncached', $block['slug'] );
		$this->assertFalse( get_transient( $this->cache_key() ) );
	}

	public function test_register_block_render_types_attributes_and_registers_meta() {
		$slug                      = 'lazyblock/registered';
		$this->registered_blocks[] = $slug;

		lazyblocks()->add_block(
			array(
				'slug'     => $slug,
				'controls' => array(
					'control_number' => array(
						'type'    => 'number',
						'name'    => 'amount',
						'default' => '3',
					),
					'control_meta'   => array(
						'type'              => 'text',
						'name'              => 'registered_meta_field',
						'save_in_meta'      => 'true',
						'save_in_meta_name' => '',
					),
				),
			)
		);
		lazyblocks()->blocks()->register_block_render();

		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $slug );

		$this->assertSame( 'number', $block_type->attributes['amount']['type'] );
		$this->assertSame( 3.0, $block_type->attributes['amount']['default'] );
		$this->assertSame( $slug, $block_type->attributes['lazyblock']['default']['slug'] );
		$this->assertArrayNotHasKey( 'registered_meta_field', $block_type->attributes );
		$this->assertTrue( registered_meta_key_exists( 'post', 'registered_meta_field' ) );

		unregister_meta_key( 'post', 'registered_meta_field' );
	}

	public function test_get_lzb_meta_reads_a_meta_control_value() {
		$this->create_db_block(
			'meta-block',
			array(
				'lazyblocks_controls' => array(
					'control_meta' => array(
						'type'              => 'text',
						'name'              => 'lzb_meta_field',
						'save_in_meta'      => 'true',
						'save_in_meta_name' => '',
					),
				),
			)
		);

		$post_id = self::factory()->post->create();
		update_post_meta( $post_id, 'lzb_meta_field', 'meta value' );

		$this->assertSame( 'meta value', get_lzb_meta( 'lzb_meta_field', $post_id ) );
	}

	public function test_db_block_renders_on_the_frontend() {
		$slug                      = 'lazyblock/rendered';
		$this->registered_blocks[] = $slug;

		$this->create_db_block(
			'rendered',
			array(
				'lazyblocks_code_frontend_html' => '<p>{{message}}</p>',
				'lazyblocks_controls'           => array(
					'control_a' => array(
						'type'      => 'text',
						'name'      => 'message',
						'placement' => 'content',
					),
				),
			)
		);
		lazyblocks()->blocks()->register_block_render();

		$this->assertSame(
			'<div class="wp-block-lazyblock-rendered"><p>hello</p></div>',
			do_blocks( '<!-- wp:lazyblock/rendered {"message":"hello"} /-->' )
		);
	}
}
