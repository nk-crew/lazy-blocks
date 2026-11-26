<?php
/**
 * Abilities that accept block controls.
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validate controls before WordPress can coerce scalars to arrays or objects.
 */
final class LazyBlocks_Ability_With_Controls extends WP_Ability {
	/**
	 * Validate input for an ability that writes block data.
	 *
	 * @param mixed $input Ability input.
	 * @return true|WP_Error
	 */
	public function validate_input( $input = null ) {
		$input_data = rest_sanitize_object( $input );
		$data       = rest_sanitize_object( $input_data['data'] ?? array() );

		if ( is_scalar( $data['controls'] ?? null ) ) {
			return new WP_Error(
				'ability_invalid_input',
				__( 'Controls must be an object or array.', 'lazy-blocks' ),
				array( 'status' => 400 )
			);
		}

		return parent::validate_input( $input );
	}
}
