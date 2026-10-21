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
		$this->assertFalse( wp_get_ability( 'lazy-blocks/update-block' )->get_meta_item( 'annotations' )['destructive'] );
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

		$this->assertSame( 'slugfromtitle', $created['data']['slug'] );
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
