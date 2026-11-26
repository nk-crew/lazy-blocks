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
	 * Post meta that records who created a block through an ability.
	 *
	 * @var string
	 */
	const CREATED_META = '_lazyblocks_ability_created';

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

		add_filter( 'display_post_states', array( $this, 'display_post_states' ), 11, 2 );
	}

	/**
	 * Mark blocks created through an ability in the list of blocks.
	 *
	 * @param array   $post_states Post states.
	 * @param WP_Post $post        Post.
	 *
	 * @return array
	 */
	public function display_post_states( $post_states, $post ) {
		if ( 'lazyblocks' === $post->post_type && get_post_meta( $post->ID, self::CREATED_META, true ) ) {
			$post_states['lazyblocks-ability-created'] = __( 'Created by AI agent', 'lazy-blocks' );
		}

		return $post_states;
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
		require_once __DIR__ . '/class-ability-with-controls.php';

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
				'ability_class'       => LazyBlocks_Ability_With_Controls::class,
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
				'ability_class'       => LazyBlocks_Ability_With_Controls::class,
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
				'meta'                => $this->get_meta( false, true, false ),
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
		$data       = $input['data'] ?? array();
		$has_filter = has_filter( 'lzb/block_data_before_write' );
		$slug       = $this->resolve_slug( $data['slug'] ?? '', $input['title'], 0, ! $has_filter );

		if ( is_wp_error( $slug ) ) {
			return $slug;
		}

		$data['slug'] = $slug;

		$allowed = $this->check_code_fields( $data, array() );

		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		$submitted = lazyblocks()->blocks()->sanitize_submitted_block_data( $this->prefix_block_data( $data ) );
		$meta      = $this->filter_write_meta( 0, $submitted, 'ability_create', $input['title'], $has_filter );
		if ( is_wp_error( $meta ) ) {
			return $meta;
		}

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

		$this->save_data( $post_id, $meta );

		update_post_meta(
			$post_id,
			self::CREATED_META,
			wp_slash(
				array(
					'user_id'  => get_current_user_id(),
					'date_gmt' => current_time( 'mysql', true ),
					'client'   => $this->get_client_name(),
				)
			)
		);

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

		if ( isset( $input['data'] ) ) {
			$allowed = $this->check_code_fields( $input['data'], $this->prepare_block( $post )['data'] );

			if ( is_wp_error( $allowed ) ) {
				return $allowed;
			}
		}

		$has_filter = has_filter( 'lzb/block_data_before_write' );
		$has_slug   = isset( $input['data']['slug'] );
		$title      = $input['title'] ?? $post->post_title;
		if ( $has_slug ) {
			$slug = $this->resolve_slug( $input['data']['slug'], $title, $post->ID, ! $has_filter );

			if ( is_wp_error( $slug ) ) {
				return $slug;
			}

			$input['data']['slug'] = $slug;
		}

		$submitted = isset( $input['data'] ) ? lazyblocks()->blocks()->sanitize_submitted_block_data( $this->prefix_block_data( $input['data'] ) ) : array();
		$meta      = null;
		$proposed  = array();
		if ( isset( $input['data'] ) && $has_filter ) {
			$proposed = array_replace( $this->prefix_block_data( $this->get_data( $post->ID ) ), $submitted );
			$meta     = $this->filter_write_meta( $post->ID, $proposed, 'ability_update', $title, $has_slug );
			if ( is_wp_error( $meta ) ) {
				return $meta;
			}
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
			if ( null === $meta || isset( $input['title'] ) ) {
				$current = array_replace( $this->prefix_block_data( $this->get_data( $post->ID ) ), $submitted );

				if ( null !== $meta ) {
					foreach ( $meta as $key => $value ) {
						if ( ! array_key_exists( $key, $proposed ) || $proposed[ $key ] !== $value ) {
							$current[ $key ] = $value;
						}
					}
					$current = array_diff_key( $current, array_diff_key( $proposed, $meta ) );
				}

				$meta = $current;
			}

			$this->save_data( $post->ID, $meta );
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
	 * @param bool   $check_collision Whether to check for a slug collision.
	 *
	 * @return string|WP_Error
	 */
	private function resolve_slug( $slug, $title, $post_id, $check_collision = true ) {
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

		if ( ! $check_collision || ( $post_id && get_post_meta( $post_id, self::META_PREFIX . 'slug', true ) === $slug ) ) {
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
	 * Refuse code fields from a user who may not post unfiltered HTML. save_meta_boxes() would
	 * drop them silently, and the caller would not learn that its code was not saved.
	 *
	 * @param array $data   Block data to save.
	 * @param array $stored Block data saved now, as get-block returns it. Empty for a new block.
	 *
	 * @return true|WP_Error
	 */
	private function check_code_fields( $data, $stored ) {
		$blocks = lazyblocks()->blocks();

		if ( $blocks->is_allowed_unfiltered_html() ) {
			return true;
		}

		$refused = array();

		// save_meta_boxes() skips the built-in keys even when a site filters them out of the list.
		$meta_keys = array_unique( array_merge( LazyBlocks_Blocks::UNFILTERED_BLOCK_META_KEYS, $blocks->get_unfiltered_block_meta_keys() ) );

		foreach ( $meta_keys as $meta_key ) {
			if ( ! str_starts_with( $meta_key, self::META_PREFIX ) ) {
				continue;
			}

			$key   = substr( $meta_key, strlen( self::META_PREFIX ) );
			$saved = (string) ( $stored[ $key ] ?? '' );

			// A value equal to the saved one changes nothing, so get-block output can be sent back.
			if ( array_key_exists( $key, $data ) && (string) $data[ $key ] !== $saved ) {
				$refused[] = $key;
			}
		}

		if ( ! $refused ) {
			return true;
		}

		return new WP_Error(
			'lazy_blocks_unfiltered_html_required',
			sprintf(
				/* translators: %s: comma-separated list of data keys. */
				__( 'Only users allowed to post unfiltered HTML can change the block code: %s. Remove these keys from data, or run the ability as a user with the unfiltered_html capability.', 'lazy-blocks' ),
				implode( ', ', $refused )
			),
			array( 'status' => 403 )
		);
	}

	/**
	 * Name of the application password the request authenticated with, which MCP clients
	 * connect through. The MCP Adapter passes no client name to abilities.
	 *
	 * @return string
	 */
	private function get_client_name() {
		$uuid = rest_get_authenticated_app_password();

		if ( ! $uuid ) {
			return '';
		}

		$password = WP_Application_Passwords::get_user_application_password( get_current_user_id(), $uuid );

		return $password ? $password['name'] : '';
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
	 * Add the storage prefix to ability block keys.
	 *
	 * @param array $data Ability block data.
	 * @return array
	 */
	private function prefix_block_data( $data ) {
		$meta = array();

		foreach ( $data as $key => $val ) {
			$meta[ self::META_PREFIX . $key ] = $val;
		}

		return $meta;
	}

	/**
	 * Filter proposed metadata and validate any change to the ability's slug.
	 *
	 * @param int    $post_id Destination post ID, or 0 before creation.
	 * @param array  $meta    Proposed metadata with the storage prefix.
	 * @param string $source  Write source.
	 * @param string $title   Proposed block title.
	 * @param bool   $check_slug Whether collision checking was deferred until after filtering.
	 * @return array|WP_Error
	 */
	private function filter_write_meta( $post_id, $meta, $source, $title, $check_slug ) {
		$filtered = lazyblocks()->blocks()->filter_block_data_before_write( $post_id, $meta, $source );
		$slug_key = self::META_PREFIX . 'slug';

		if ( $check_slug || ( $filtered[ $slug_key ] ?? '' ) !== ( $meta[ $slug_key ] ?? '' ) ) {
			$slug = $this->resolve_slug( $filtered[ $slug_key ] ?? '', $title, $post_id );
			if ( is_wp_error( $slug ) ) {
				return $slug;
			}
			$filtered[ $slug_key ] = $slug;
		}

		return $filtered;
	}

	/**
	 * Store filtered block metadata using the shared writer.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $meta    Filtered block metadata.
	 */
	private function save_data( $post_id, $meta ) {
		lazyblocks()->blocks()->save_meta_boxes( $post_id, $meta, null );
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
