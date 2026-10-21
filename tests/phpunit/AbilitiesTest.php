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

		parent::tear_down();
	}

	private function run_ability( $name, $input = null ) {
		$ability = wp_get_ability( $name );

		$this->assertInstanceOf( WP_Ability::class, $ability, $name . ' is not registered.' );

		return $ability->execute( $input );
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
}
