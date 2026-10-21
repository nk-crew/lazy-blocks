<?php
/**
 * Abilities API integration.
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class LazyBlocks_Abilities
 *
 * Registers abilities that read and write blocks in the block builder format:
 * the post meta keys without the `lazyblocks_` prefix, as the builder's
 * `get-block-data` and `update-block-data` REST routes use them.
 */
class LazyBlocks_Abilities {
	/**
	 * Ability category slug.
	 *
	 * @var string
	 */
	const CATEGORY = 'lazy-blocks';

	/**
	 * Builder meta prefix.
	 *
	 * @var string
	 */
	const META_PREFIX = 'lazyblocks_';

	/**
	 * LazyBlocks_Abilities constructor.
	 */
	public function __construct() {
		// The Abilities API exists since WordPress 6.9.
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		add_action( 'wp_abilities_api_categories_init', array( $this, 'register_category' ) );
		add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
	}

	/**
	 * Register the ability category. Required before WordPress 7.2.
	 */
	public function register_category() {
		wp_register_ability_category(
			self::CATEGORY,
			array(
				'label'       => __( 'Lazy Blocks', 'lazy-blocks' ),
				'description' => __( 'Abilities that read and manage blocks made in the Lazy Blocks builder.', 'lazy-blocks' ),
			)
		);
	}

	/**
	 * Register abilities.
	 */
	public function register_abilities() {
		$block_schema = $this->get_block_schema();

		wp_register_ability(
			'lazy-blocks/list-blocks',
			array(
				'label'               => __( 'List Lazy Blocks', 'lazy-blocks' ),
				'description'         => __( 'Returns the blocks made in the Lazy Blocks builder with their ID, title, status and slug.', 'lazy-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'additionalProperties' => false,
					'default'              => array(),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'blocks' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'id'     => array( 'type' => 'integer' ),
									'title'  => array( 'type' => 'string' ),
									'status' => array( 'type' => 'string' ),
									'slug'   => array( 'type' => 'string' ),
								),
							),
						),
					),
				),
				'execute_callback'    => array( $this, 'list_blocks' ),
				'permission_callback' => array( $this, 'permission' ),
				'meta'                => $this->get_meta( true, false, true ),
			)
		);

		wp_register_ability(
			'lazy-blocks/get-block',
			array(
				'label'               => __( 'Get Lazy Block', 'lazy-blocks' ),
				'description'         => __( 'Returns one Lazy Blocks block with all its builder data: controls, code, supports, styles and condition.', 'lazy-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'id' => array(
							'type'        => 'integer',
							'description' => __( 'Block post ID.', 'lazy-blocks' ),
							'minimum'     => 1,
						),
					),
					'required'             => array( 'id' ),
					'additionalProperties' => false,
				),
				'output_schema'       => $block_schema,
				'execute_callback'    => array( $this, 'get_block' ),
				'permission_callback' => array( $this, 'permission' ),
				'meta'                => $this->get_meta( true, false, true ),
			)
		);

		wp_register_ability(
			'lazy-blocks/create-block',
			array(
				'label'               => __( 'Create Lazy Block', 'lazy-blocks' ),
				'description'         => __( 'Creates and publishes a new Lazy Blocks block. Data keys not given take the builder defaults.', 'lazy-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'title' => array(
							'type'        => 'string',
							'description' => __( 'Block title.', 'lazy-blocks' ),
							'minLength'   => 1,
						),
						'data'  => $block_schema['properties']['data'],
					),
					'required'             => array( 'title' ),
					'additionalProperties' => false,
				),
				'output_schema'       => $block_schema,
				'execute_callback'    => array( $this, 'create_block' ),
				'permission_callback' => array( $this, 'create_permission' ),
				'meta'                => $this->get_meta( false, false, false ),
			)
		);

		wp_register_ability(
			'lazy-blocks/update-block',
			array(
				'label'               => __( 'Update Lazy Block', 'lazy-blocks' ),
				'description'         => __( 'Updates the title or builder data of a Lazy Blocks block. Only the given top-level data keys change, and each given key is replaced whole: a given controls or supports object replaces the stored one instead of merging into it.', 'lazy-blocks' ),
				'category'            => self::CATEGORY,
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => array(
						'id'    => array(
							'type'        => 'integer',
							'description' => __( 'Block post ID.', 'lazy-blocks' ),
							'minimum'     => 1,
						),
						'title' => array(
							'type'        => 'string',
							'description' => __( 'New block title.', 'lazy-blocks' ),
							'minLength'   => 1,
						),
						'data'  => $block_schema['properties']['data'],
					),
					'required'             => array( 'id' ),
					'additionalProperties' => false,
				),
				'output_schema'       => $block_schema,
				'execute_callback'    => array( $this, 'update_block' ),
				'permission_callback' => array( $this, 'update_permission' ),
				'meta'                => $this->get_meta( false, true, true ),
			)
		);
	}

	/**
	 * Ability meta.
	 *
	 * @param bool $is_readonly Whether the ability only reads.
	 * @param bool $destructive Whether the ability may overwrite existing data.
	 * @param bool $idempotent  Whether repeated calls have no additional effect.
	 *
	 * @return array
	 */
	private function get_meta( $is_readonly, $destructive, $idempotent ) {
		return array(
			'annotations'  => array(
				'readonly'    => $is_readonly,
				'destructive' => $destructive,
				'idempotent'  => $idempotent,
			),
			'show_in_rest' => true,
		);
	}

	/**
	 * Schema of one block in the builder format.
	 *
	 * @return array
	 */
	private function get_block_schema() {
		$keys = array();

		foreach ( array_keys( lazyblocks()->blocks()->get_block_defaults() ) as $meta_key ) {
			$keys[] = substr( $meta_key, strlen( self::META_PREFIX ) );
		}

		return array(
			'type'       => 'object',
			'properties' => array(
				'id'     => array( 'type' => 'integer' ),
				'title'  => array( 'type' => 'string' ),
				'status' => array( 'type' => 'string' ),
				'data'   => array(
					'type'                 => 'object',
					'description'          => sprintf(
						/* translators: %s: comma-separated list of data keys. */
						__( 'Block builder data. Keys: %s.', 'lazy-blocks' ),
						implode( ', ', $keys )
					),
					'properties'           => array(
						'slug'               => array( 'type' => 'string' ),
						'icon'               => array( 'type' => 'string' ),
						'description'        => array( 'type' => 'string' ),
						'keywords'           => array(
							'type'        => 'string',
							'description' => __( 'Comma-separated keywords.', 'lazy-blocks' ),
						),
						'category'           => array( 'type' => 'string' ),
						'controls'           => array(
							'type'        => array( 'object', 'array' ),
							'description' => __( 'Controls keyed by control ID.', 'lazy-blocks' ),
						),
						'code_output_method' => array(
							'type' => 'string',
							'enum' => array( 'html', 'php', 'template' ),
						),
						'code_frontend_html' => array( 'type' => 'string' ),
						'code_editor_html'   => array( 'type' => 'string' ),
						'code_single_output' => array( 'type' => 'boolean' ),
						'code_show_preview'  => array( 'type' => 'string' ),
						'style_block'        => array( 'type' => 'string' ),
						'style_editor'       => array( 'type' => 'string' ),
						'script_view'        => array( 'type' => 'string' ),
					),
					'additionalProperties' => true,
				),
			),
		);
	}

	/**
	 * Permission callback for all abilities.
	 *
	 * @return bool
	 */
	public function permission() {
		return current_user_can( 'edit_lazyblocks' );
	}

	/**
	 * Permission callback for create-block, which publishes the new block.
	 *
	 * @return bool
	 */
	public function create_permission() {
		return $this->permission() && current_user_can( get_post_type_object( 'lazyblocks' )->cap->publish_posts );
	}

	/**
	 * Permission callback for update-block.
	 *
	 * @param array $input Ability input.
	 *
	 * @return bool
	 */
	public function update_permission( $input ) {
		if ( ! $this->permission() ) {
			return false;
		}

		$post = $this->get_block_post( $input['id'] );

		// A missing block is reported as not found by the execute callback.
		return is_wp_error( $post ) || current_user_can( 'edit_post', $post->ID );
	}

	/**
	 * List blocks.
	 *
	 * @return array
	 */
	public function list_blocks() {
		$posts = get_posts(
			array(
				'post_type'      => 'lazyblocks',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'orderby'        => 'ID',
				'order'          => 'ASC',
			)
		);

		$blocks = array();

		foreach ( $posts as $post ) {
			$blocks[] = array(
				'id'     => $post->ID,
				'title'  => $post->post_title,
				'status' => $post->post_status,
				'slug'   => (string) get_post_meta( $post->ID, 'lazyblocks_slug', true ),
			);
		}

		return array( 'blocks' => $blocks );
	}

	/**
	 * Get block.
	 *
	 * @param array $input Ability input.
	 *
	 * @return array|WP_Error
	 */
	public function get_block( $input ) {
		$post = $this->get_block_post( $input['id'] );

		if ( is_wp_error( $post ) ) {
			return $post;
		}

		return $this->prepare_block( $post );
	}

	/**
	 * Create block.
	 *
	 * @param array $input Ability input.
	 *
	 * @return array|WP_Error
	 */
	public function create_block( $input ) {
		$data = isset( $input['data'] ) ? $input['data'] : array();
		$slug = $this->resolve_slug( isset( $data['slug'] ) ? $data['slug'] : '', $input['title'], 0 );

		if ( is_wp_error( $slug ) ) {
			return $slug;
		}

		$data['slug'] = $slug;

		$post_id = wp_insert_post(
			array(
				'post_title'  => wp_strip_all_tags( $input['title'] ),
				'post_status' => 'publish',
				'post_type'   => 'lazyblocks',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$this->save_data( $post_id, $data );

		return $this->prepare_block( get_post( $post_id ) );
	}

	/**
	 * Update block.
	 *
	 * @param array $input Ability input.
	 *
	 * @return array|WP_Error
	 */
	public function update_block( $input ) {
		$post = $this->get_block_post( $input['id'] );

		if ( is_wp_error( $post ) ) {
			return $post;
		}

		if ( isset( $input['data']['slug'] ) ) {
			$title = isset( $input['title'] ) ? $input['title'] : $post->post_title;
			$slug  = $this->resolve_slug( $input['data']['slug'], $title, $post->ID );

			if ( is_wp_error( $slug ) ) {
				return $slug;
			}

			$input['data']['slug'] = $slug;
		}

		if ( isset( $input['title'] ) ) {
			$result = wp_update_post(
				array(
					'ID'         => $post->ID,
					'post_title' => wp_strip_all_tags( $input['title'] ),
				),
				true
			);

			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		if ( isset( $input['data'] ) ) {
			// save_meta_boxes() resets every key it is not given, so start from the stored data.
			$data = array_merge( $this->get_data( $post->ID ), $input['data'] );

			$this->save_data( $post->ID, $data );
		}

		return $this->prepare_block( get_post( $post->ID ) );
	}

	/**
	 * Resolve the slug a block will be saved with, and refuse one the editor cannot register
	 * or another block already uses.
	 *
	 * @param string $slug    Requested slug. Empty derives it from the title, as the builder does.
	 * @param string $title   Block title.
	 * @param int    $post_id ID of the block being saved, 0 for a new one.
	 *
	 * @return string|WP_Error
	 */
	private function resolve_slug( $slug, $title, $post_id ) {
		$blocks = lazyblocks()->blocks();

		if ( '' === $slug ) {
			$slug = sanitize_title( $title );
		}

		$slug = $blocks->sanitize_slug( $slug );

		// The same pattern the builder validates (assets/utils/block-slug isValidSlug).
		$name = false === strpos( $slug, '/' ) ? 'lazyblock/' . $slug : $slug;

		if ( ! preg_match( '/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/', $name ) ) {
			return new WP_Error(
				'lazy_blocks_invalid_slug',
				__( 'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter.', 'lazy-blocks' ),
				array( 'status' => 400 )
			);
		}

		if ( $post_id && get_post_meta( $post_id, self::META_PREFIX . 'slug', true ) === $slug ) {
			return $slug;
		}

		$taken = (bool) get_posts(
			array(
				'post_type'      => 'lazyblocks',
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'post__not_in'   => array( $post_id ),
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'     => array(
					array(
						'key'   => self::META_PREFIX . 'slug',
						'value' => $slug,
					),
				),
			)
		);

		if ( ! $taken ) {
			foreach ( $blocks->get_blocks() as $block ) {
				if ( isset( $block['slug'] ) && $name === $block['slug'] && ( empty( $block['id'] ) || (int) $block['id'] !== $post_id ) ) {
					$taken = true;
					break;
				}
			}
		}

		// A block being saved is registered under its stored slug, so a registered new name belongs to another block.
		if ( ! $taken ) {
			$taken = WP_Block_Type_Registry::get_instance()->is_registered( $name );
		}

		if ( $taken ) {
			return new WP_Error(
				'lazy_blocks_slug_taken',
				__( 'Another block already uses this slug.', 'lazy-blocks' ),
				array( 'status' => 400 )
			);
		}

		return $slug;
	}

	/**
	 * Get block post by ID.
	 *
	 * @param int $id Post ID.
	 *
	 * @return WP_Post|WP_Error
	 */
	private function get_block_post( $id ) {
		$post = get_post( $id );

		if ( ! $post || 'lazyblocks' !== $post->post_type || 'trash' === $post->post_status ) {
			return new WP_Error(
				'lazy_blocks_block_not_found',
				__( 'Block not found.', 'lazy-blocks' ),
				array( 'status' => 404 )
			);
		}

		return $post;
	}

	/**
	 * Block data without the meta prefix, as the builder's get-block-data route returns it.
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return array
	 */
	private function get_data( $post_id ) {
		$data = array();

		foreach ( lazyblocks()->blocks()->get_meta_boxes( $post_id ) as $key => $val ) {
			$data[ substr( $key, strlen( self::META_PREFIX ) ) ] = $val;
		}

		return $data;
	}

	/**
	 * Save block data through the same writer as the builder's update-block-data route.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $data    Block data without the meta prefix.
	 */
	private function save_data( $post_id, $data ) {
		$meta = array();

		foreach ( $data as $key => $val ) {
			$meta[ self::META_PREFIX . $key ] = $val;
		}

		lazyblocks()->blocks()->save_meta_boxes( $post_id, $meta );
		lazyblocks()->blocks()->clear_blocks_cache();
	}

	/**
	 * Prepare ability output for one block.
	 *
	 * @param WP_Post $post Block post.
	 *
	 * @return array
	 */
	private function prepare_block( $post ) {
		$data   = $this->get_data( $post->ID );
		$schema = $this->get_block_schema();

		// get_meta_value() turns any stored 'true'/'false' into a boolean, also for text fields.
		foreach ( $schema['properties']['data']['properties'] as $key => $property ) {
			if ( 'string' === $property['type'] && isset( $data[ $key ] ) && is_bool( $data[ $key ] ) ) {
				$data[ $key ] = $data[ $key ] ? 'true' : 'false';
			}
		}

		return array(
			'id'     => $post->ID,
			'title'  => $post->post_title,
			'status' => $post->post_status,
			'data'   => $data,
		);
	}
}

new LazyBlocks_Abilities();
