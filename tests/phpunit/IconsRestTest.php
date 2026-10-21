<?php
/**
 * Tests for the icons REST route used by the icon picker outside the block builder.
 *
 * @package Lazy Blocks
 */

/**
 * Class IconsRestTest
 */
class IconsRestTest extends WP_UnitTestCase {
	/**
	 * Request the icons route as the given user.
	 *
	 * @param int $user_id User ID.
	 *
	 * @return WP_REST_Response
	 */
	private function request_icons( $user_id ) {
		wp_set_current_user( $user_id );

		return rest_do_request( new WP_REST_Request( 'GET', '/lazy-blocks/v1/get-icons' ) );
	}

	/**
	 * A subscriber cannot read the icons.
	 */
	public function test_get_icons_refused_for_subscriber() {
		$response = $this->request_icons( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$this->assertTrue( $response->is_error() );
		$this->assertSame( 'lazy_block_icons_cannot_read', $response->as_error()->get_error_code() );
		$this->assertArrayNotHasKey( 'response', $response->get_data() );
	}

	/**
	 * An editor gets the full icons list.
	 */
	public function test_get_icons_returns_list_for_editor() {
		$response = $this->request_icons( self::factory()->user->create( array( 'role' => 'editor' ) ) );
		$data     = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertSame( lazyblocks()->icons()->get_all(), $data['response'] );
		$this->assertStringContainsString( '<svg', $data['response']['action']['accessibility'] );
	}

	/**
	 * A role that edits only pages gets the list too.
	 */
	public function test_get_icons_returns_list_for_pages_only_role() {
		add_role(
			'lzb_pages_only',
			'Pages only',
			array(
				'read'       => true,
				'edit_pages' => true,
			)
		);
		$user_id = self::factory()->user->create( array( 'role' => 'lzb_pages_only' ) );

		$this->assertFalse( user_can( $user_id, 'edit_posts' ) );
		$this->assertSame( 200, $this->request_icons( $user_id )->get_status() );

		remove_role( 'lzb_pages_only' );
	}
}
