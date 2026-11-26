<?php

class LegacyTemplatesTest extends WP_UnitTestCase {
	public function test_saved_template_keeps_blocks_lock_and_custom_fields_support() {
		$templates = lazyblocks()->templates();
		$blocks    = array(
			array( 'core/heading', array( 'content' => 'Heading' ) ),
			array(
				'core/group',
				array(),
				array( array( 'core/paragraph', array( 'content' => 'Nested text' ) ) ),
			),
		);
		$post_id = self::factory()->post->create(
			array(
				'post_type' => 'lazyblocks_templates',
				'post_status' => 'publish',
				'meta_input' => array(
					'_lzb_template_post_types' => array( 'book' ),
					'_lzb_template_lock' => 'all',
					'_lzb_template_blocks' => rawurlencode( wp_json_encode( $blocks ) ),
				),
			)
		);

		try {
			$templates->get_templates( true, true );
			$this->assertSame(
				array(
					'supports' => array( 'title', 'custom-fields' ),
					'template' => $blocks,
					'template_lock' => 'all',
				),
				$templates->register_post_type_args( array( 'supports' => array( 'title' ) ), 'book' )
			);
		} finally {
			wp_delete_post( $post_id, true );
			$templates->get_templates( true, true );
		}
	}
}
