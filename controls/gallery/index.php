<?php
/**
 * Gallery Control.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Control_Gallery class.
 */
class LazyBlocks_Control_Gallery extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->name         = 'gallery';
		$this->icon         = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 8V19C21 20.1046 20.1057 21 19.0011 21C15.8975 21 9.87435 21 6 21" stroke="currentColor" stroke-width="1.5"/><path d="M16.375 3.75H4.625C4.14175 3.75 3.75 4.14175 3.75 4.625V16.375C3.75 16.8582 4.14175 17.25 4.625 17.25H16.375C16.8582 17.25 17.25 16.8582 17.25 16.375V4.625C17.25 4.14175 16.8582 3.75 16.375 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M4 14L7.71429 12L10.5 13.3333L13.75 11L17 13.3333" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
		$this->type         = 'string';
		$this->label        = __( 'Gallery', 'lazy-blocks' );
		$this->category     = 'content';
		$this->restrictions = array(
			'default_settings' => false,
		);
		$this->attributes   = array(
			'preview_size' => 'medium',
		);

		parent::__construct();
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		LazyBlocks_Assets::register_script( 'lazyblocks-control-gallery', 'build/control-gallery' );
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lazyblocks-control-gallery' );
	}

	/**
	 * Lets get actual image data from DB.
	 *
	 * @param array $data image data.
	 *
	 * @return array
	 */
	public function maybe_update_image_data( $data ) {
		if ( isset( $data['id'] ) ) {
			$attachment_meta = wp_get_attachment_metadata( $data['id'] );

			if ( ! empty( $attachment_meta ) ) {
				$attachment = get_post( $data['id'] );

				if ( isset( $attachment_meta['sizes'] ) ) {
					$sizes = array();

					foreach ( $attachment_meta['sizes'] as $name => $size ) {
						$sizes[ $name ] = array(
							'width'       => $size['width'],
							'height'      => $size['height'],
							'url'         => wp_get_attachment_image_url( $data['id'], $name ),
							'orientation' => $size['width'] >= $size['height'] ? 'landscape' : 'portrait',
						);
					}

					$data['sizes'] = $sizes;
				}

				$data['alt']         = get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true );
				$data['caption']     = $attachment->post_excerpt;
				$data['description'] = $attachment->post_content;
				$data['title']       = get_the_title( $attachment->ID );
				$data['url']         = wp_get_attachment_image_url( $attachment->ID, 'full' );
				$data['link']        = get_permalink( $attachment->ID );
			}
		}

		return $data;
	}

	/**
	 * Change control output to array.
	 *
	 * @param mixed  $value - control value.
	 * @param array  $control_data - control data.
	 * @param array  $block_data - block data.
	 * @param string $context - block render context.
	 *
	 * @return string|array
	 */
	// phpcs:ignore
	public function filter_control_value( $value, $control_data, $block_data, $context ) {
		if ( ! is_string( $value ) && ! is_array( $value ) ) {
			return $value;
		}

		// Maybe decode.
		if ( is_string( $value ) ) {
			$value = json_decode( rawurldecode( $value ), true );
		}

		if ( ! empty( $value ) ) {
			$new_result = array();

			foreach ( $value as $k => $val ) {
				$new_result[ $k ] = $this->maybe_update_image_data( $val );
			}

			$value = $new_result;
		}

		return $value;
	}
}

new LazyBlocks_Control_Gallery();
