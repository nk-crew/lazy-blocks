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
		$_GET['lazyblocks_duplicate_block_nonce'] = wp_create_nonce( 'lzb-duplicate-block-nonce' );

		$location = $this->catch_redirect(
			function () {
				lazyblocks()->tools()->duplicate_block( $this->block_id );
			}
		);

		unset( $_GET['lazyblocks_duplicate_block_nonce'] );

		$this->assertStringContainsString( 'lazyblocks_duplicate_complete=', $location );
		$this->assertSame( 2, count( get_posts( array( 'post_type' => 'lazyblocks', 'post_status' => 'any' ) ) ) );
	}
}
