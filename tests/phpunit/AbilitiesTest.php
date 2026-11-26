<?php
/**
 * Lazy Blocks abilities (WordPress Abilities API, 6.9+).
 */
class AbilitiesTest extends WP_UnitTestCase {

	private $admin_user;
	private $editor_user;
	private $block_id;

	public function set_up() {
		parent::set_up();

		if ( ! function_exists( 'wp_register_ability' ) ) {
			$this->markTestSkipped( 'The Abilities API needs WordPress 6.9 or later.' );
		}

		lazyblocks()->blocks()->register_post_type();

		update_option( LazyBlocks_Abilities::WRITE_OPTION, true );
		$this->reset_abilities_registry();

		$admin_role = get_role( 'administrator' );
		$admin_role->add_cap( 'edit_lazyblocks' );
		$admin_role->add_cap( 'edit_lazyblock' );
		$admin_role->add_cap( 'publish_lazyblocks' );

		$this->admin_user  = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->editor_user = self::factory()->user->create( array( 'role' => 'editor' ) );

		// Single site admins hold unfiltered_html, so code fields are saved.
		$this->block_id = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_title'  => 'Existing Block',
				'post_status' => 'publish',
			)
		);

		wp_set_current_user( $this->admin_user );
		lazyblocks()->blocks()->save_meta_boxes(
			$this->block_id,
			array(
				'lazyblocks_slug'               => 'existing-block',
				'lazyblocks_description'        => 'Existing description',
				'lazyblocks_code_frontend_html' => '<p useBlockProps>Existing</p>',
			)
		);
		wp_set_current_user( 0 );
	}

	public function tear_down() {
		wp_set_current_user( 0 );

		delete_option( LazyBlocks_Abilities::WRITE_OPTION );
		$this->reset_abilities_registry();

		parent::tear_down();
	}

	/**
	 * Drop the registry, so the next lookup fires wp_abilities_api_init again with the current option.
	 */
	private function reset_abilities_registry() {
		if ( ! class_exists( 'WP_Abilities_Registry' ) ) {
			return;
		}

		$instance = new ReflectionProperty( WP_Abilities_Registry::class, 'instance' );
		$instance->setValue( null, null );
	}

	private function create_user_without_unfiltered_html() {
		$user = self::factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$user->add_cap( 'unfiltered_html', false );

		return $user;
	}

	private function run_ability( $name, $input = null ) {
		$ability = wp_get_ability( $name );

		$this->assertInstanceOf( WP_Ability::class, $ability, $name . ' is not registered.' );

		return $ability->execute( $input );
	}

	private function run_ability_rest( $name, $input ) {
		$request = new WP_REST_Request( 'POST', '/wp-abilities/v1/abilities/' . $name . '/run' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( wp_json_encode( array( 'input' => $input ) ) );

		return rest_do_request( $request );
	}

	public function test_abilities_are_registered_for_rest() {
		foreach ( array( 'list-blocks', 'get-block', 'create-block', 'update-block' ) as $name ) {
			$ability = wp_get_ability( 'lazy-blocks/' . $name );

			$this->assertInstanceOf( WP_Ability::class, $ability, $name );
			$this->assertSame( 'lazy-blocks', $ability->get_category() );
			$this->assertTrue( $ability->get_meta_item( 'show_in_rest' ) );
		}

		$this->assertTrue( wp_get_ability( 'lazy-blocks/get-block' )->get_meta_item( 'annotations' )['readonly'] );
		$this->assertTrue( wp_get_ability( 'lazy-blocks/update-block' )->get_meta_item( 'annotations' )['destructive'] );
	}

	public function test_user_without_edit_lazyblocks_is_refused() {
		wp_set_current_user( $this->editor_user );

		$count_before = (int) wp_count_posts( 'lazyblocks' )->publish;

		$result = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $this->block_id ) );
		$this->assertWPError( $result );
		$this->assertSame( 'ability_invalid_permissions', $result->get_error_code() );

		$result = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Refused Block' ) );
		$this->assertWPError( $result );
		wp_cache_flush();
		$this->assertSame( $count_before, (int) wp_count_posts( 'lazyblocks' )->publish );

		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'description' => 'Changed' ),
			)
		);
		$this->assertWPError( $result );
		$this->assertSame( 'Existing description', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
	}

	public function test_list_and_get_return_builder_data() {
		wp_set_current_user( $this->admin_user );

		$list = $this->run_ability( 'lazy-blocks/list-blocks' );
		$this->assertNotWPError( $list );
		$this->assertContains(
			array(
				'id'     => $this->block_id,
				'title'  => 'Existing Block',
				'status' => 'publish',
				'slug'   => 'existing-block',
			),
			$list['blocks']
		);

		$block = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $this->block_id ) );
		$this->assertNotWPError( $block );
		$this->assertSame( $this->block_id, $block['id'] );
		$this->assertSame( 'Existing Block', $block['title'] );
		$this->assertSame( 'existing-block', $block['data']['slug'] );
		$this->assertSame( '<p useBlockProps>Existing</p>', $block['data']['code_frontend_html'] );
		// Unset keys come back with builder defaults.
		$this->assertSame( 'text', $block['data']['category'] );
		$this->assertFalse( $block['data']['supports_border'] );

		$missing = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => self::factory()->post->create() ) );
		$this->assertWPError( $missing );
		$this->assertSame( 'lazy_blocks_block_not_found', $missing->get_error_code() );
	}

	public function test_create_then_get_round_trip() {
		wp_set_current_user( $this->admin_user );

		$created = $this->run_ability(
			'lazy-blocks/create-block',
			array(
				'title' => 'Created Block',
				'data'  => array(
					'slug'               => 'created-block',
					'category'           => 'design',
					'code_frontend_html' => '<div useBlockProps>{{text}}</div>',
					'supports_border'    => array(
						'color'  => true,
						'radius' => false,
						'style'  => true,
						'width'  => true,
					),
					'controls'           => array(
						'control_1' => array(
							'type'  => 'text',
							'name'  => 'text',
							'label' => 'Text',
						),
					),
				),
			)
		);

		$this->assertNotWPError( $created );
		$this->assertSame( 'lazyblocks', get_post_type( $created['id'] ) );
		$this->assertSame( 'publish', get_post_status( $created['id'] ) );

		$block = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $created['id'] ) );

		$this->assertSame( 'Created Block', $block['title'] );
		$this->assertSame( 'created-block', $block['data']['slug'] );
		$this->assertSame( 'design', $block['data']['category'] );
		$this->assertSame( '<div useBlockProps>{{text}}</div>', $block['data']['code_frontend_html'] );
		$this->assertSame(
			array(
				'color'  => true,
				'radius' => false,
				'style'  => true,
				'width'  => true,
			),
			$block['data']['supports_border']
		);
		$this->assertSame( 'text', $block['data']['controls']['control_1']['name'] );
		$this->assertSame( $created, $block );

		// The block registers from the stored data.
		$registered = lazyblocks()->blocks()->get_block( 'lazyblock/created-block', true );
		$this->assertSame( 'Created Block', $registered['title'] );
	}

	public function test_create_without_slug_uses_title() {
		wp_set_current_user( $this->admin_user );

		$created = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Slug From Title' ) );

		$this->assertSame( 'slug-from-title', $created['data']['slug'] );
	}

	public function test_create_without_publish_capability_is_refused() {
		$user = self::factory()->user->create_and_get( array( 'role' => 'editor' ) );
		$user->add_cap( 'edit_lazyblocks' );
		wp_set_current_user( $user->ID );

		$count_before = (int) wp_count_posts( 'lazyblocks' )->publish;

		$result = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Unpublished Block' ) );

		$this->assertWPError( $result );
		$this->assertSame( 'ability_invalid_permissions', $result->get_error_code() );
		wp_cache_flush();
		$this->assertSame( $count_before, (int) wp_count_posts( 'lazyblocks' )->publish );
	}

	public function test_update_without_edit_post_capability_is_refused() {
		$user = self::factory()->user->create_and_get( array( 'role' => 'editor' ) );
		$user->add_cap( 'edit_lazyblocks' );
		wp_set_current_user( $user->ID );

		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'description' => 'Changed' ),
			)
		);

		$this->assertWPError( $result );
		$this->assertSame( 'ability_invalid_permissions', $result->get_error_code() );
		$this->assertSame( 'Existing description', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
	}

	public function test_create_with_taken_slug_is_refused() {
		wp_set_current_user( $this->admin_user );

		lazyblocks()->add_block(
			array(
				'title' => 'PHP Block',
				'slug'  => 'lazyblock/php-block',
			)
		);
		register_block_type( 'lazyblock/registered-block' );

		$count_before = (int) wp_count_posts( 'lazyblocks' )->publish;

		foreach ( array( 'existing-block', 'php-block', 'registered-block' ) as $slug ) {
			$result = $this->run_ability(
				'lazy-blocks/create-block',
				array(
					'title' => 'Duplicate',
					'data'  => array( 'slug' => $slug ),
				)
			);

			$this->assertWPError( $result, $slug );
			$this->assertSame( 'lazy_blocks_slug_taken', $result->get_error_code(), $slug );
			$this->assertSame( 400, $result->get_error_data()['status'], $slug );
		}

		// A slug taken through the title is refused as well.
		$result = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Existing Block' ) );
		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_slug_taken', $result->get_error_code() );

		lazyblocks()->blocks()->remove_block( 'lazyblock/php-block' );
		unregister_block_type( 'lazyblock/registered-block' );

		wp_cache_flush();
		$this->assertSame( $count_before, (int) wp_count_posts( 'lazyblocks' )->publish );
	}

	public function test_update_to_taken_slug_is_refused() {
		wp_set_current_user( $this->admin_user );

		$other = $this->run_ability(
			'lazy-blocks/create-block',
			array(
				'title' => 'Other Block',
				'data'  => array( 'slug' => 'other-block' ),
			)
		);
		$this->assertNotWPError( $other );

		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $other['id'],
				'data' => array( 'slug' => 'existing-block' ),
			)
		);

		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_slug_taken', $result->get_error_code() );
		$this->assertSame( 'other-block', get_post_meta( $other['id'], 'lazyblocks_slug', true ) );

		// Keeping its own slug is not a conflict.
		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'slug' => 'existing-block' ),
			)
		);
		$this->assertNotWPError( $result );
	}

	public function test_slug_the_editor_cannot_register_is_refused() {
		wp_set_current_user( $this->admin_user );

		$count_before = (int) wp_count_posts( 'lazyblocks' )->publish;

		$cases = array(
			array(
				'title' => 'Numeric Slug',
				'data'  => array( 'slug' => '1-block' ),
			),
			array( 'title' => '123' ),
			array( 'title' => '!!!' ),
		);

		foreach ( $cases as $input ) {
			$result = $this->run_ability( 'lazy-blocks/create-block', $input );

			$this->assertWPError( $result, $input['title'] );
			$this->assertSame( 'lazy_blocks_invalid_slug', $result->get_error_code(), $input['title'] );
			$this->assertSame( 400, $result->get_error_data()['status'], $input['title'] );
		}

		wp_cache_flush();
		$this->assertSame( $count_before, (int) wp_count_posts( 'lazyblocks' )->publish );

		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'slug' => '9lives' ),
			)
		);
		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_invalid_slug', $result->get_error_code() );
		$this->assertSame( 'existing-block', get_post_meta( $this->block_id, 'lazyblocks_slug', true ) );
	}

	public function test_boolean_like_strings_keep_schema_types() {
		wp_set_current_user( $this->admin_user );

		$created = $this->run_ability(
			'lazy-blocks/create-block',
			array(
				'title' => 'True',
				'data'  => array( 'description' => 'false' ),
			)
		);

		$this->assertNotWPError( $created );
		$this->assertSame( 'true', $created['data']['slug'] );
		$this->assertSame( 'false', $created['data']['description'] );

		$block = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $created['id'] ) );

		$this->assertNotWPError( $block );
		$this->assertSame( 'true', $block['data']['slug'] );
		$this->assertSame( 'false', $block['data']['description'] );
	}

	public function test_update_changes_only_given_field() {
		wp_set_current_user( $this->admin_user );

		$before = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $this->block_id ) );

		$after = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'description' => 'Updated description' ),
			)
		);

		$this->assertNotWPError( $after );
		$this->assertSame( 'Updated description', $after['data']['description'] );
		$this->assertSame( 'Updated description', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );

		$expected                        = $before;
		$expected['data']['description'] = 'Updated description';
		$this->assertSame( $expected, $after );
	}

	public function test_write_abilities_apply_filter_to_create_and_update() {
		wp_set_current_user( $this->admin_user );
		$filter = static function ( $data, $stored, $context ) {
			if ( 'ability_create' === $context['source'] && array() === $stored ) {
				$data['lazyblocks_description'] = 'Allowed on creation';
			} elseif ( 'ability_update' === $context['source'] ) {
				$data['lazyblocks_description'] = $stored['lazyblocks_description'];
			}
			return $data;
		};
		add_filter( 'lzb/block_data_before_write', $filter, 10, 3 );

		try {
			$created = $this->run_ability(
				'lazy-blocks/create-block',
				array(
					'title' => 'Filtered block',
					'data'  => array( 'description' => 'Proposed on creation' ),
				)
			);
			$this->assertNotWPError( $created );
			$this->assertSame( 'Allowed on creation', get_post_meta( $created['id'], 'lazyblocks_description', true ) );

			$updated = $this->run_ability(
				'lazy-blocks/update-block',
				array(
					'id'   => $created['id'],
					'data' => array(
						'description' => 'Proposed on update',
						'category'    => 'design',
					),
				)
			);
			$this->assertNotWPError( $updated );
			$this->assertSame( 'Allowed on creation', get_post_meta( $created['id'], 'lazyblocks_description', true ) );
			$this->assertSame( 'design', get_post_meta( $created['id'], 'lazyblocks_category', true ) );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter, 10 );
		}
	}

	public function test_filtered_update_keeps_meta_written_during_title_save() {
		wp_set_current_user( $this->admin_user );
		$refresh_meta = static function ( $post_id ) {
			update_post_meta( $post_id, 'lazyblocks_description', 'Refreshed during title save' );
			update_post_meta( $post_id, 'lazyblocks_keywords', 'Title keywords' );
		};
		$filter = static function ( $data ) {
			$data['lazyblocks_keywords'] = 'Filtered keywords';
			return $data;
		};
		add_action( 'save_post_lazyblocks', $refresh_meta );
		add_filter( 'lzb/block_data_before_write', $filter );
		try {
			$updated = $this->run_ability(
				'lazy-blocks/update-block',
				array(
					'id'    => $this->block_id,
					'title' => 'Updated title',
					'data'  => array( 'category' => 'design' ),
				)
			);
			$this->assertNotWPError( $updated );
			$this->assertSame( 'Updated title', $updated['title'] );
			$this->assertSame( 'design', $updated['data']['category'] );
			$this->assertSame( 'Refreshed during title save', $updated['data']['description'] );
			$this->assertSame( 'Filtered keywords', $updated['data']['keywords'] );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter );
			remove_action( 'save_post_lazyblocks', $refresh_meta );
		}
	}

	public function test_filtered_slug_cannot_collide_on_create_or_update() {
		wp_set_current_user( $this->admin_user );
		$target = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Target block' ) );
		$this->assertNotWPError( $target );

		$filter = static function ( $data ) {
			$data['lazyblocks_slug'] = 'existing-block';
			return $data;
		};
		add_filter( 'lzb/block_data_before_write', $filter );
		try {
			$count   = (int) wp_count_posts( 'lazyblocks' )->publish;
			$created = $this->run_ability(
				'lazy-blocks/create-block',
				array(
					'title' => 'Rejected block',
					'data'  => array( 'slug' => 'newspace/existing-block' ),
				)
			);
			$this->assertWPError( $created );
			$this->assertSame( 'lazy_blocks_slug_taken', $created->get_error_code() );
			$this->assertSame( $count, (int) wp_count_posts( 'lazyblocks' )->publish );

			$updated = $this->run_ability(
				'lazy-blocks/update-block',
				array(
					'id'    => $target['id'],
					'title' => 'Rejected title',
					'data'  => array( 'slug' => 'newspace/existing-block' ),
				)
			);
			$this->assertWPError( $updated );
			$this->assertSame( 'lazy_blocks_slug_taken', $updated->get_error_code() );
			$this->assertSame( 'Target block', get_post( $target['id'] )->post_title );
			$this->assertSame( 'target-block', get_post_meta( $target['id'], 'lazyblocks_slug', true ) );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter );
		}
	}

	public function test_rest_update_round_trips_typed_builder_data() {
		wp_set_current_user( $this->admin_user );

		$controls = array(
			'control_repeater' => array(
				'type'    => 'repeater',
				'name'    => 'rows',
				'default' => array( array( 'amount' => 2.75, 'enabled' => false ) ),
			),
			'control_amount'   => array(
				'type'     => 'number',
				'name'     => 'amount',
				'child_of' => 'control_repeater',
				'default'  => 2.75,
			),
		);
		$before   = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $this->block_id ) );
		$input    = array(
			'id'    => $this->block_id,
			'title' => 'Updated Block',
			'data'  => array_replace(
				$before['data'],
				array(
					'controls'        => $controls,
					'supports_border' => array( 'color' => true, 'radius' => false ),
				)
			),
		);

		$response = $this->run_ability_rest( 'lazy-blocks/update-block', $input );
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( $controls, get_post_meta( $this->block_id, 'lazyblocks_controls', true ) );

		$request = new WP_REST_Request( 'GET', '/wp-abilities/v1/abilities/lazy-blocks/get-block/run' );
		$request->set_query_params( array( 'input' => array( 'id' => (string) $this->block_id ) ) );
		$read = rest_do_request( $request );
		$this->assertSame( 200, $read->get_status() );
		$this->assertSame( wp_json_encode( $response->get_data() ), wp_json_encode( $read->get_data() ) );

		delete_post_meta( $this->block_id, 'lazyblocks_controls' );
		$direct = $this->run_ability( 'lazy-blocks/update-block', $input );
		$this->assertNotWPError( $direct );
		$this->assertSame( $controls, get_post_meta( $this->block_id, 'lazyblocks_controls', true ) );
		$this->assertSame( $direct, json_decode( wp_json_encode( $response->get_data() ), true ) );
	}

	public function test_create_rest_accepts_json_controls() {
		wp_set_current_user( $this->admin_user );

		$controls = array(
			array( 'type' => 'number', 'name' => 'amount', 'default' => 2.75 ),
		);
		$response = $this->run_ability_rest(
			'lazy-blocks/create-block',
			array(
				'title' => 'Created over REST',
				'data'  => array( 'controls' => $controls ),
			)
		);

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( $controls, get_post_meta( $response->get_data()['id'], 'lazyblocks_controls', true ) );
	}

	public function test_rest_create_rejects_scalar_controls() {
		wp_set_current_user( $this->admin_user );

		foreach ( array( 'invalid', '', false, true, 2, 2.75, null ) as $value ) {
			$response = $this->run_ability_rest(
				'lazy-blocks/create-block',
				array(
					'title' => 'Invalid Controls',
					'data'  => array( 'controls' => $value ),
				)
			);

			$this->assertSame( 400, $response->get_status() );
			$this->assertSame( 'ability_invalid_input', $response->get_data()['code'] );
		}
	}

	public function test_update_rejects_scalar_controls() {
		wp_set_current_user( $this->admin_user );

		$before = get_post_meta( $this->block_id, 'lazyblocks_controls', true );
		foreach ( array( 'invalid', '', false, true, 2, 2.75, null ) as $value ) {
			$input = array(
				'id'   => $this->block_id,
				'data' => array( 'controls' => $value ),
			);

			$direct = $this->run_ability( 'lazy-blocks/update-block', $input );
			$this->assertWPError( $direct );
			$this->assertSame( 'ability_invalid_input', $direct->get_error_code() );

			$response = $this->run_ability_rest( 'lazy-blocks/update-block', $input );
			$this->assertSame( 400, $response->get_status() );
			$this->assertSame( 'ability_invalid_input', $response->get_data()['code'] );
		}
		$this->assertSame( $before, get_post_meta( $this->block_id, 'lazyblocks_controls', true ) );
	}

	public function test_write_abilities_are_not_registered_without_the_option() {
		delete_option( LazyBlocks_Abilities::WRITE_OPTION );
		$this->reset_abilities_registry();
		wp_set_current_user( $this->admin_user );

		$this->assertTrue( wp_has_ability( 'lazy-blocks/list-blocks' ) );
		$this->assertTrue( wp_has_ability( 'lazy-blocks/get-block' ) );
		$this->assertFalse( wp_has_ability( 'lazy-blocks/create-block' ) );
		$this->assertFalse( wp_has_ability( 'lazy-blocks/update-block' ) );

		// WP-CLI stores the value as typed, without the setting's sanitizer.
		foreach ( array( 'false', 'off', 'no', 'enabled' ) as $value ) {
			update_option( LazyBlocks_Abilities::WRITE_OPTION, $value );
			$this->reset_abilities_registry();
			$this->assertFalse( wp_has_ability( 'lazy-blocks/create-block' ), $value );
		}

		$response = $this->run_ability_rest( 'lazy-blocks/create-block', array( 'title' => 'Not Registered' ) );
		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'rest_ability_not_found', $response->get_data()['code'] );
	}

	public function test_create_with_code_without_unfiltered_html_is_refused() {
		wp_set_current_user( $this->create_user_without_unfiltered_html()->ID );

		$count_before = (int) wp_count_posts( 'lazyblocks' )->publish;

		$result = $this->run_ability(
			'lazy-blocks/create-block',
			array(
				'title' => 'Code Block',
				'data'  => array(
					'code_frontend_html' => '<p>Code</p>',
					'script_view'        => 'alert(1)',
				),
			)
		);

		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_unfiltered_html_required', $result->get_error_code() );
		$this->assertStringContainsString( 'code_frontend_html, script_view', $result->get_error_message() );
		wp_cache_flush();
		$this->assertSame( $count_before, (int) wp_count_posts( 'lazyblocks' )->publish );

		$created = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Block Without Code' ) );
		$this->assertNotWPError( $created );

		// save_meta_boxes() still skips a built-in key that a site filters out of the list.
		add_filter(
			'lzb/unfiltered_block_meta_keys',
			static function ( $keys ) {
				return array_diff( $keys, array( 'lazyblocks_code_frontend_html' ) );
			}
		);

		$result = $this->run_ability(
			'lazy-blocks/create-block',
			array(
				'title' => 'Filtered Code Block',
				'data'  => array( 'code_frontend_html' => '<p>Code</p>' ),
			)
		);

		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_unfiltered_html_required', $result->get_error_code() );
	}

	public function test_update_code_without_unfiltered_html_is_refused() {
		wp_set_current_user( $this->create_user_without_unfiltered_html()->ID );

		$result = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array(
					'description'      => 'Changed',
					'code_editor_html' => '<p>Editor</p>',
				),
			)
		);

		$this->assertWPError( $result );
		$this->assertSame( 'lazy_blocks_unfiltered_html_required', $result->get_error_code() );
		$this->assertSame( 'Existing description', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
		$this->assertSame( '', get_post_meta( $this->block_id, 'lazyblocks_code_editor_html', true ) );

		// Data read with get-block sends the saved code back unchanged, which is allowed.
		$block                        = $this->run_ability( 'lazy-blocks/get-block', array( 'id' => $this->block_id ) );
		$block['data']['description'] = 'Changed';

		$updated = $this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => $block['data'],
			)
		);

		$this->assertNotWPError( $updated );
		$this->assertSame( 'Changed', $updated['data']['description'] );
		$this->assertSame( '<p useBlockProps>Existing</p>', $updated['data']['code_frontend_html'] );
	}

	public function test_create_records_who_created_the_block() {
		wp_set_current_user( $this->admin_user );

		$password = WP_Application_Passwords::create_new_application_password( $this->admin_user, array( 'name' => wp_slash( 'Claude\\Desktop' ) ) );

		$GLOBALS['wp_rest_application_password_uuid'] = $password[1]['uuid'];
		$created = $this->run_ability( 'lazy-blocks/create-block', array( 'title' => 'Agent Block' ) );
		unset( $GLOBALS['wp_rest_application_password_uuid'] );

		$record = get_post_meta( $created['id'], LazyBlocks_Abilities::CREATED_META, true );
		$this->assertSame( $this->admin_user, $record['user_id'] );
		$this->assertSame( 'Claude\\Desktop', $record['client'] );
		$this->assertEqualsWithDelta( time(), strtotime( $record['date_gmt'] . ' UTC' ), 60 );

		$states = apply_filters( 'display_post_states', array(), get_post( $created['id'] ) );
		$this->assertSame( 'Created by AI agent', $states['lazyblocks-ability-created'] );

		$this->run_ability(
			'lazy-blocks/update-block',
			array(
				'id'   => $this->block_id,
				'data' => array( 'description' => 'Changed' ),
			)
		);
		$this->assertSame( '', get_post_meta( $this->block_id, LazyBlocks_Abilities::CREATED_META, true ) );
		$this->assertArrayNotHasKey( 'lazyblocks-ability-created', apply_filters( 'display_post_states', array(), get_post( $this->block_id ) ) );
	}
}
