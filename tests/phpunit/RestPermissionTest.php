<?php
/**
 * Permission checks of the block builder REST routes and admin block actions.
 */
class RestPermissionTest extends WP_UnitTestCase {
	/**
	 * Administrator user id.
	 *
	 * @var int
	 */
	private $admin_user;

	/**
	 * Editor user id (edit_posts, no Lazy Blocks edit capabilities).
	 *
	 * @var int
	 */
	private $editor_user;

	/**
	 * Lazy block post id.
	 *
	 * @var int
	 */
	private $block_id;

	/**
	 * Regular post id.
	 *
	 * @var int
	 */
	private $post_id;

	/**
	 * Set up users, posts and the REST server.
	 */
	public function set_up() {
		parent::set_up();

		lazyblocks()->blocks()->register_post_type();
		lazyblocks()->blocks()->sync_role_caps();

		$this->admin_user  = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$this->editor_user = self::factory()->user->create( array( 'role' => 'editor' ) );

		$this->block_id = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_status' => 'publish',
				'post_author' => $this->admin_user,
			)
		);
		$this->post_id  = self::factory()->post->create(
			array(
				'post_status' => 'publish',
				'post_author' => $this->editor_user,
			)
		);

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	/**
	 * Reset the REST server and preview globals.
	 */
	public function tear_down() {
		global $wp_rest_server, $lzb_block_builder_preview;
		$wp_rest_server            = null;
		$lzb_block_builder_preview = false;

		if ( class_exists( 'WP_Block_Supports' ) ) {
			WP_Block_Supports::$block_to_render = null;
		}

		unset( $_GET['lazyblocks_duplicate_block_nonce'], $_GET['lazyblocks_activate_complete'], $_GET['lazyblocks_activation_type'], $_GET['lazyblocks_block_id'], $_GET['lazyblocks_duplicate_complete'] );

		remove_all_filters( 'wp_redirect' );
		remove_all_filters( 'lzb/block_render/callback' );

		parent::tear_down();
	}

	/**
	 * Send a POST request to a plugin route.
	 *
	 * @param string $route  Route without namespace.
	 * @param array  $params Body params.
	 *
	 * @return WP_REST_Response
	 */
	private function post( $route, $params ) {
		$request = new WP_REST_Request( 'POST', '/lazy-blocks/v1/' . $route );
		$request->set_body_params( $params );

		return rest_do_request( $request );
	}

	/**
	 * Run a callback that ends in wp_safe_redirect() + exit, and return the redirect location.
	 *
	 * @param callable $callback Callback.
	 *
	 * @return string|null Location, or null when no redirect happened.
	 */
	private function catch_redirect( $callback ) {
		add_filter(
			'wp_redirect',
			function ( $location ) {
				throw new RuntimeException( $location );
			}
		);

		try {
			$callback();
		} catch ( RuntimeException $e ) {
			return $e->getMessage();
		}

		return null;
	}

	/**
	 * Run an admin notice handler of a fresh tools instance and return the printed notices.
	 *
	 * @param string $handler Handler method name.
	 *
	 * @return string
	 */
	private function render_notices( $handler ) {
		$tools = new LazyBlocks_Tools();
		$tools->$handler();

		ob_start();
		$tools->admin_notices();

		return ob_get_clean();
	}

	/**
	 * Editor granted edit_lazyblocks, who still cannot edit a block of another author.
	 *
	 * @return int User id.
	 */
	private function create_block_editor_without_post_cap() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		get_userdata( $user_id )->add_cap( 'edit_lazyblocks' );

		return $user_id;
	}

	/**
	 * Builder preview data with Handlebars output.
	 *
	 * @param string $output_method Output method.
	 *
	 * @return array
	 */
	private function preview_params( $output_method = 'html' ) {
		return array(
			'context'    => 'frontend',
			'attributes' => array(),
			'block'      => array(
				'slug'               => 'rest-preview-test',
				'code_output_method' => $output_method,
				'code_frontend_html' => 'php' === $output_method ? '<?php echo "php-ran"; ?>' : 'preview-output',
			),
		);
	}

	public function test_update_block_data_refuses_regular_post() {
		wp_set_current_user( $this->editor_user );

		$response = $this->post(
			'update-block-data',
			array(
				'post_id' => $this->post_id,
				'data'    => array( 'description' => 'injected' ),
			)
		);

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( '', get_post_meta( $this->post_id, 'lazyblocks_description', true ) );
	}

	public function test_update_block_data_refuses_regular_post_for_admin() {
		wp_set_current_user( $this->admin_user );

		$response = $this->post(
			'update-block-data',
			array(
				'post_id' => $this->post_id,
				'data'    => array( 'description' => 'injected' ),
			)
		);

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( '', get_post_meta( $this->post_id, 'lazyblocks_description', true ) );
	}

	public function test_update_block_data_refuses_user_who_cannot_edit_block() {
		wp_set_current_user( $this->editor_user );

		$response = $this->post(
			'update-block-data',
			array(
				'post_id' => $this->block_id,
				'data'    => array( 'description' => 'injected' ),
			)
		);

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( '', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
	}

	public function test_update_block_data_allows_block_editor() {
		wp_set_current_user( $this->admin_user );

		$response = $this->post(
			'update-block-data',
			array(
				'post_id' => $this->block_id,
				'data'    => array( 'description' => 'Saved description' ),
			)
		);

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'Saved description', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
	}

	public function test_block_builder_preview_refuses_user_without_edit_lazyblocks() {
		wp_set_current_user( $this->editor_user );

		$response = $this->post( 'block-builder-preview', $this->preview_params() );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'lazy_block_cannot_preview', $response->get_data()['code'] );
	}

	public function test_block_builder_preview_allows_edit_lazyblocks_user() {
		wp_set_current_user( $this->admin_user );

		$response = $this->post( 'block-builder-preview', $this->preview_params() );

		$this->assertSame( 200, $response->get_status() );
		$this->assertStringContainsString( 'preview-output', $response->get_data()['response'] );
	}

	public function test_block_builder_preview_refuses_php_without_unfiltered_html() {
		wp_set_current_user( $this->admin_user );

		$deny_unfiltered_html = function ( $caps, $cap ) {
			return 'unfiltered_html' === $cap ? array( 'do_not_allow' ) : $caps;
		};
		add_filter( 'map_meta_cap', $deny_unfiltered_html, 10, 2 );

		$response = $this->post( 'block-builder-preview', $this->preview_params( 'php' ) );

		remove_filter( 'map_meta_cap', $deny_unfiltered_html, 10 );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'lazy_block_cannot_execute_php', $response->get_data()['code'] );
	}

	public function test_editor_preview_returns_handlebars_template_error() {
		wp_set_current_user( $this->editor_user );
		lazyblocks()->add_block(
			array(
				'slug' => 'lazyblock/invalid-template',
				'code' => array(
					'editor_html' => '{{#if a}}A{{else if b}}B{{else}}C{{/if}}',
				),
			)
		);

		try {
			$response = $this->post(
				'block-render',
				array(
					'name'            => 'lazyblock/invalid-template',
					'post_id'         => $this->post_id,
					'attributes'      => array( 'a' => true ),
					'render_location' => 'editor',
				)
			);
		} finally {
			lazyblocks()->blocks()->remove_block( 'lazyblock/invalid-template' );
		}

		$this->assertSame( 401, $response->get_status() );
		$this->assertSame( 'lazy_block_render_failed', $response->get_data()['error_code'] );
		$this->assertSame( 'Variable name is invalid: "else if b"', $response->get_data()['message'] );
	}

	public function test_block_builder_preview_trace_follows_wp_debug() {
		wp_set_current_user( $this->admin_user );

		add_filter(
			'lzb/block_render/callback',
			function () {
				throw new Exception( 'preview-exception' );
			}
		);

		$response = $this->post( 'block-builder-preview', $this->preview_params() );
		$message  = $response->get_data()['message'];

		$this->assertStringStartsWith( 'preview-exception', $message );

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$this->assertStringContainsString( '#0 ', $message );
		} else {
			$this->assertSame( 'preview-exception', $message );
		}
	}

	public function test_activate_skips_posts_that_are_not_blocks() {
		wp_set_current_user( $this->admin_user );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->deactivate( array( $this->post_id ) );
			}
		);

		$this->assertNull( $location );
		$this->assertSame( 'publish', get_post_status( $this->post_id ) );
	}

	public function test_activate_changes_block_status() {
		wp_set_current_user( $this->admin_user );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->deactivate( array( $this->block_id, $this->post_id ) );
			}
		);

		$this->assertStringContainsString( 'lazyblocks_activate_complete=1', $location );
		$this->assertSame( 'draft', get_post_status( $this->block_id ) );
		$this->assertSame( 'publish', get_post_status( $this->post_id ) );
	}

	public function test_duplicate_refuses_posts_that_are_not_blocks() {
		wp_set_current_user( $this->admin_user );
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );

		$count_before = (int) wp_count_posts( 'post' )->publish + (int) wp_count_posts( 'post' )->draft;

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->duplicate_block( $this->post_id );
			}
		);

		unset( $_GET['lazyblocks_duplicate_block_nonce'] );

		$this->assertNull( $location );
		$this->assertSame( $count_before, (int) wp_count_posts( 'post' )->publish + (int) wp_count_posts( 'post' )->draft );
	}

	public function test_duplicate_copies_block() {
		wp_set_current_user( $this->admin_user );
		add_post_meta( $this->block_id, 'lazyblocks_slug', 'original-block' );
		add_post_meta( $this->block_id, 'lazyblocks_description', 'First value' );
		add_post_meta( $this->block_id, 'lazyblocks_description', 'Second value' );
		add_post_meta( $this->block_id, 'custom_meta', wp_slash( array( 'path' => 'C:\\example' ) ) );
		update_post_meta( $this->block_id, LazyBlocks_Abilities::CREATED_META, array( 'user_id' => $this->admin_user ) );
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->duplicate_block( $this->block_id );
			}
		);

		unset( $_GET['lazyblocks_duplicate_block_nonce'] );

		$this->assertStringContainsString( 'lazyblocks_duplicate_complete=', $location );
		$this->assertSame( 2, count( get_posts( array( 'post_type' => 'lazyblocks', 'post_status' => 'any' ) ) ) );

		// A copy made by a person is not a block an ability created.
		$copy_id = (int) wp_parse_args( wp_parse_url( $location, PHP_URL_QUERY ) )['lazyblocks_duplicate_complete'];
		$this->assertSame( get_post( $copy_id )->post_name, get_post_meta( $copy_id, 'lazyblocks_slug', true ) );
		$this->assertSame( array( 'First value', 'Second value' ), get_post_meta( $copy_id, 'lazyblocks_description' ) );
		$this->assertSame( array( 'path' => 'C:\\example' ), get_post_meta( $copy_id, 'custom_meta', true ) );
		$this->assertSame( '', get_post_meta( $copy_id, LazyBlocks_Abilities::CREATED_META, true ) );
		$this->assertNotEmpty( get_post_meta( $this->block_id, LazyBlocks_Abilities::CREATED_META, true ) );
	}

	public function test_duplicate_reads_each_meta_key_when_it_copies_it() {
		wp_set_current_user( $this->admin_user );
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );
		add_post_meta( $this->block_id, 'first_meta', 'First value' );
		add_post_meta( $this->block_id, 'second_meta', 'Initial value' );

		$sync_source = function ( $meta_id, $post_id, $meta_key ) {
			if ( $this->block_id !== $post_id && 'first_meta' === $meta_key ) {
				update_post_meta( $this->block_id, 'second_meta', 'Refreshed value' );
			}
		};
		add_action( 'added_post_meta', $sync_source, 10, 3 );
		try {
			$location = $this->catch_redirect(
				function () {
					lazyblocks()->tools()->duplicate_block( $this->block_id );
				}
			);
			$copy_id = (int) wp_parse_args( wp_parse_url( $location, PHP_URL_QUERY ) )['lazyblocks_duplicate_complete'];
			$this->assertSame( 'Refreshed value', get_post_meta( $copy_id, 'second_meta', true ) );
		} finally {
			remove_action( 'added_post_meta', $sync_source, 10 );
		}
	}

	public function test_import_writes_nested_block_data() {
		wp_set_current_user( $this->admin_user );
		$post_id = lazyblocks()->tools()->import_block(
			array(
				'title'    => 'Imported block',
				'slug'     => 'lazyblock/imported-block',
				'keywords' => array( 'first', 'second' ),
				'controls' => array( 'field' => array( 'name' => 'field' ) ),
				'code'     => array( 'frontend_html' => '<p>Imported</p>' ),
			)
		);

		$this->assertSame( 'imported-block', get_post_meta( $post_id, 'lazyblocks_slug', true ) );
		$this->assertSame( 'first,second', get_post_meta( $post_id, 'lazyblocks_keywords', true ) );
		$this->assertSame( 'text', get_post_meta( $post_id, 'lazyblocks_controls', true )['field']['type'] );
		$this->assertSame( '<p>Imported</p>', get_post_meta( $post_id, 'lazyblocks_code_frontend_html', true ) );
	}

	public function test_rest_filter_keeps_stored_description() {
		wp_set_current_user( $this->admin_user );
		update_post_meta( $this->block_id, 'lazyblocks_description', wp_slash( 'Existing C:\\example' ) );
		$filter = static function ( $data, $stored, $context ) {
			if ( 'rest' === $context['source'] ) {
				$data['lazyblocks_description'] = $stored['lazyblocks_description'];
			}
			return $data;
		};
		add_filter( 'lzb/block_data_before_write', $filter, 10, 3 );

		try {
			$response = $this->post(
				'update-block-data',
				array(
					'post_id' => $this->block_id,
					'data'    => array(
						'slug'        => 'updated-block',
						'description' => 'Changed description',
					),
				)
			);
			$this->assertSame( 200, $response->get_status() );
			$this->assertSame( 'Existing C:\\example', get_post_meta( $this->block_id, 'lazyblocks_description', true ) );
			$this->assertSame( 'updated-block', get_post_meta( $this->block_id, 'lazyblocks_slug', true ) );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter, 10 );
		}
	}

	public function test_import_filter_can_remove_controls_from_a_new_block() {
		wp_set_current_user( $this->admin_user );
		$filter = static function ( $data, $stored, $context ) {
			if ( 'import' === $context['source'] && array() === $stored ) {
				unset( $data['lazyblocks_controls'] );
			}
			return $data;
		};
		add_filter( 'lzb/block_data_before_write', $filter, 10, 3 );

		try {
			$post_id = lazyblocks()->tools()->import_block(
				array(
					'title'    => 'Imported block',
					'slug'     => 'lazyblock/imported-block',
					'controls' => array( 'field' => array( 'name' => 'field' ) ),
				)
			);
			$this->assertSame( 'imported-block', get_post_meta( $post_id, 'lazyblocks_slug', true ) );
			$this->assertFalse( metadata_exists( 'post', $post_id, 'lazyblocks_controls' ) );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter, 10 );
		}
	}

	public function test_duplicate_filter_limits_the_copy_without_touching_the_source() {
		wp_set_current_user( $this->admin_user );
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );
		add_post_meta( $this->block_id, 'lazyblocks_controls', array( 'field' => array( 'type' => 'text' ) ) );
		add_post_meta( $this->block_id, 'lazyblocks_controls', array( 'other' => array( 'type' => 'text' ) ) );
		add_post_meta( $this->block_id, 'lazyblocks_description', 'First value' );
		add_post_meta( $this->block_id, 'lazyblocks_description', 'Second value' );

		$filter = function ( $data, $stored, $context ) {
			if ( 'duplicate' === $context['source'] && array() === $stored && $this->block_id !== $context['post_id'] ) {
				unset( $data['lazyblocks_controls'] );
				$data['lazyblocks_supports_inserter'] = false;
			}
			return $data;
		};
		add_filter( 'lzb/block_data_before_write', $filter, 10, 3 );

		try {
			$location = $this->catch_redirect(
				function () {
					lazyblocks()->tools()->duplicate_block( $this->block_id );
				}
			);
			$copy_id = (int) wp_parse_args( wp_parse_url( $location, PHP_URL_QUERY ) )['lazyblocks_duplicate_complete'];
			$this->assertSame( array( 'First value', 'Second value' ), get_post_meta( $copy_id, 'lazyblocks_description' ) );
			$this->assertFalse( metadata_exists( 'post', $copy_id, 'lazyblocks_controls' ) );
			$this->assertSame( 'false', get_post_meta( $copy_id, 'lazyblocks_supports_inserter', true ) );
			$this->assertCount( 2, get_post_meta( $this->block_id, 'lazyblocks_controls' ) );
		} finally {
			remove_filter( 'lzb/block_data_before_write', $filter, 10 );
		}
	}

	public function test_update_block_data_builds_empty_slug_from_title() {
		wp_set_current_user( $this->admin_user );
		wp_update_post(
			array(
				'ID'         => $this->block_id,
				'post_title' => 'My Fancy Block',
			)
		);
		// The REST request carries no global post, so the slug must come from the saved post.
		$GLOBALS['post'] = null;

		$response = $this->post(
			'update-block-data',
			array(
				'post_id' => $this->block_id,
				'data'    => array( 'slug' => '' ),
			)
		);

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'myfancyblock', get_post_meta( $this->block_id, 'lazyblocks_slug', true ) );
	}

	public function test_activate_notice_hides_title_from_user_who_cannot_edit() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$private_id = self::factory()->post->create(
			array(
				'post_status' => 'private',
				'post_title'  => 'Secret private title',
				'post_author' => $this->admin_user,
			)
		);
		wp_set_current_user( $subscriber );

		$_GET['lazyblocks_activate_complete'] = '1';
		$_GET['lazyblocks_activation_type']   = 'activate';
		$_GET['lazyblocks_block_id']          = (string) $private_id;

		$output = $this->render_notices( 'maybe_activate_block' );

		$this->assertStringContainsString( 'Activated 1 block', $output );
		$this->assertStringNotContainsString( 'Secret private title', $output );
	}

	public function test_duplicate_notice_hides_title_from_user_who_cannot_edit() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$draft_id   = self::factory()->post->create(
			array(
				'post_type'   => 'lazyblocks',
				'post_status' => 'draft',
				'post_title'  => 'Secret draft block',
				'post_author' => $this->admin_user,
			)
		);
		wp_set_current_user( $subscriber );

		$_GET['lazyblocks_duplicate_complete'] = (string) $draft_id;

		$this->assertSame( '', trim( $this->render_notices( 'maybe_duplicate_block' ) ) );
	}

	public function test_duplicate_notice_shows_title_to_block_editor() {
		wp_update_post(
			array(
				'ID'         => $this->block_id,
				'post_title' => 'Visible block',
			)
		);
		wp_set_current_user( $this->admin_user );

		$_GET['lazyblocks_duplicate_complete'] = (string) $this->block_id;

		$this->assertStringContainsString( 'Visible block', $this->render_notices( 'maybe_duplicate_block' ) );
	}

	public function test_activate_refuses_user_without_edit_post_on_block() {
		wp_set_current_user( $this->create_block_editor_without_post_cap() );

		$this->assertTrue( current_user_can( 'edit_lazyblocks' ) );
		$this->assertFalse( current_user_can( 'edit_post', $this->block_id ) );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->deactivate( array( $this->block_id ) );
			}
		);

		$this->assertNull( $location );
		$this->assertSame( 'publish', get_post_status( $this->block_id ) );
	}

	public function test_duplicate_refuses_user_without_edit_post_on_block() {
		wp_set_current_user( $this->create_block_editor_without_post_cap() );
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->duplicate_block( $this->block_id );
			}
		);

		unset( $_GET['lazyblocks_duplicate_block_nonce'] );

		$this->assertNull( $location );
		$this->assertSame( 1, count( get_posts( array( 'post_type' => 'lazyblocks', 'post_status' => 'any' ) ) ) );
	}
}
