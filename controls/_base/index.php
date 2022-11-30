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
        'placement_settings'            => array( 'content', 'inspector' ),
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

        // Actions.
        add_action( 'enqueue_block_editor_assets', array( $this, 'register_assets' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'action_script_depends' ), 11 );
        add_action( 'enqueue_block_editor_assets', array( $this, 'action_style_depends' ), 11 );
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
     * Register assets action.
     */
    public function register_assets() {
        // nothing here.
    }

    /**
     * Action script dependencies
     */
    public function action_script_depends() {
        foreach ( (array) $this->get_script_depends() as $script ) {
            wp_enqueue_script( $script );
        }
    }

    /**
     * Action style dependencies
     */
    public function action_style_depends() {
        foreach ( (array) $this->get_style_depends() as $style ) {
            wp_enqueue_style( $style );
        }
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
