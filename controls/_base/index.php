<?php
/**
 * LazyBlocks controls base class.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * LazyBlocks_Control class.
 */
class LazyBlocks_Control {
	/**
	 * Control unique name.
	 *
	 * @var string
	 */
	public $name;

	/**
	 * Control icon SVG.
	 * You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
	 *
	 * @var string
	 */
	public $icon = '';

	/**
	 * Control value type [string, number, boolean, array].
	 *
	 * @var string
	 */
	public $type = 'string';

	/**
	 * Control label.
	 *
	 * @var string
	 */
	public $label;

	/**
	 * Category name.
	 *
	 * @var string
	 */
	public $category = 'basic';

	/**
	 * Default Restrictions.
	 *
	 * @var array
	 */
	public $default_restrictions = array(
		'once'                          => false,
		'as_child'                      => true,
		'hidden_from_select'            => false,

		// Display Settings.
		'name_settings'                 => true,
		'label_settings'                => true,
		'default_settings'              => true,
		'help_settings'                 => true,
		'placement_settings'            => array( 'content', 'inspector' /* , 'content-fallback', 'inspector-fallback' */ ),
		'group_settings'                => true,
		'width_settings'                => true,
		'required_settings'             => true,
		'hide_if_not_selected_settings' => true,
		'translate_settings'            => false,
		'save_in_meta_settings'         => true,
	);

	/**
	 * Restrictions.
	 *
	 * @var array
	 */
	public $restrictions;

	/**
	 * Default Attributes used in all controls.
	 *
	 * @var array
	 */
	public $default_attributes = array(
		'type'                 => 'text',
		'name'                 => '',
		'default'              => '',
		'label'                => '',
		'help'                 => '',
		'child_of'             => '',
		'placement'            => 'content',
		'group'                => 'default',
		'width'                => '100',
		'hide_if_not_selected' => 'false',
		'required'             => 'false',
		'translate'            => 'false',
		'save_in_meta'         => 'false',
		'save_in_meta_name'    => '',
	);

	/**
	 * Attributes.
	 *
	 * @var array
	 */
	public $attributes;

	/**
	 * Constructor
	 */
	public function __construct() {
		// Merge default restrictions with custom.
		$this->restrictions = array_merge(
			$this->default_restrictions,
			(array) $this->restrictions
		);

		// Merge default attributes with custom.
		$this->attributes = array_merge(
			$this->default_attributes,
			(array) $this->attributes
		);

		// Filters.
		add_filter( 'lzb/controls/all', array( $this, 'get_control_data' ) );
		add_filter(
			'lzb/control_value',
			function( $value, $control_data, $block_data, $context ) {
				if ( ! $control_data || $this->name !== $control_data['type'] ) {
					return $value;
				}

				return $this->filter_control_value( $value, $control_data, $block_data, $context );
			},
			5,
			4
		);

		// Actions.
		add_action( 'enqueue_block_editor_assets', array( $this, 'register_assets' ) );
		add_action(
			'enqueue_block_editor_assets',
			function() {
				$blocks = lazyblocks()->blocks()->get_blocks();

				// Skip assets enqueue if there are no blocks.
				// Allow on block builder page even if no blocks, since we need control assets here.
				if ( empty( $blocks ) && 'lazyblocks' !== get_post_type() ) {
					return;
				}

				foreach ( (array) $this->get_script_depends() as $script ) {
					wp_enqueue_script( $script );
				}
			},
			11
		);
		add_action(
			'enqueue_block_assets',
			function() {
				if ( ! is_admin() ) {
					return;
				}

				$blocks = lazyblocks()->blocks()->get_blocks();

				// Skip assets enqueue if there are no blocks.
				// Allow on block builder page even if no blocks, since we need control assets here.
				if ( empty( $blocks ) && 'lazyblocks' !== get_post_type() ) {
					return;
				}

				foreach ( (array) $this->get_style_depends() as $style ) {
					wp_enqueue_style( $style );
				}
			},
			11
		);
	}

	/**
	 * Get control data
	 *
	 * @param array $controls available controls.
	 *
	 * @return array
	 */
	public function get_control_data( $controls ) {
		return array_merge(
			$controls,
			array(
				$this->name => array(
					'name'         => $this->name,
					'icon'         => $this->icon,
					'type'         => $this->type,
					'label'        => $this->label,
					'category'     => $this->category,
					'restrictions' => $this->restrictions,
					'attributes'   => $this->attributes,
				),
			)
		);
	}

	/**
	 * Filter control value.
	 *
	 * @param mixed  $value - control value.
	 * @param array  $control_data - control data.
	 * @param array  $block_data - block data.
	 * @param string $context - block render context.
	 *
	 * @return mixed
	 */
	// phpcs:ignore
	public function filter_control_value( $value, $control_data, $block_data, $context ) {
		return $value;
	}

	/**
	 * Register assets action.
	 */
	public function register_assets() {
		// nothing here.
	}

	/**
	 * Get script dependencies.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array();
	}

	/**
	 * Get style dependencies.
	 *
	 * @return array style dependencies.
	 */
	public function get_style_depends() {
		return array();
	}
}
