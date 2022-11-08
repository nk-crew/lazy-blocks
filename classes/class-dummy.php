<?php
/**
 * LazyBlocks dummy.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LazyBlocks_Dummy class. Class to work with LazyBlocks Controls.
 */
class LazyBlocks_Dummy {
    /**
     * Name of option that will prevent multiple example blocks creation.
     *
     * @var string
     */
    private static $option_name = 'lzb_dummy_added';

    /**
     * LazyBlocks_Dummy constructor.
     */
    public function __construct() {}

    /**
     * Add dummy block
     */
    public static function add() {
        // Check if already added example block.
        if ( get_option( self::$option_name, false ) ) {
            return;
        }

        // Check if any blocks already added.
        $blocks = get_posts(
            array(
                'post_type'   => 'lazyblocks',
                'numberposts' => 1,
                'post_status' => 'any',
                'fields'      => 'ids',
            )
        );

        if ( count( $blocks ) > 0 ) {
            return;
        }

        // Create new post.
        $post_id = wp_insert_post(
            array(
                'post_title'  => esc_attr__( 'Example Block', 'lazy-blocks' ),
                'post_status' => 'draft',
                'post_type'   => 'lazyblocks',
            )
        );

        $code = '<?php if ( isset( $attributes[\'image\'][\'url\'] ) ) : ?>
  <p>
    <img src="<?php echo esc_url( $attributes[\'image\'][\'url\'] ); ?>" alt="<?php echo esc_attr( $attributes[\'image\'][\'alt\'] ); ?>">
  </p>

  <?php if ( isset( $attributes[\'button-label\'] ) ) : ?>
    <p>
      <a href="<?php echo esc_url( $attributes[\'button-url\'] ); ?>" class="button button-primary">
        <?php echo esc_html( $attributes[\'button-label\'] ); ?>
      </a>
    </p>
  <?php endif; ?>
<?php else: ?>
  <p>Image is required to show this block content.</p>
<?php endif; ?>';

        if ( $post_id ) {
            lazyblocks()->blocks()->save_meta_boxes(
                $post_id,
                array(
                    'lazyblocks_controls'               => array(
                        'control_005ad74de2' => array(
                            'type'                 => 'image',
                            'name'                 => 'image',
                            'default'              => '',
                            'label'                => 'Image',
                            'help'                 => '',
                            'child_of'             => '',
                            'placement'            => 'inspector',
                            'width'                => '100',
                            'hide_if_not_selected' => 'false',
                            'save_in_meta'         => 'false',
                            'save_in_meta_name'    => '',
                            'required'             => 'false',
                            'placeholder'          => '',
                            'characters_limit'     => '',
                        ),
                        'control_1729664f06' => array(
                            'type'                 => 'text',
                            'name'                 => 'button-label',
                            'default'              => '',
                            'label'                => 'Button Label',
                            'help'                 => '',
                            'child_of'             => '',
                            'placement'            => 'inspector',
                            'width'                => '100',
                            'hide_if_not_selected' => 'false',
                            'save_in_meta'         => 'false',
                            'save_in_meta_name'    => '',
                            'required'             => 'false',
                            'placeholder'          => '',
                            'characters_limit'     => '',
                        ),
                        'control_8b591545a2' => array(
                            'type'                 => 'url',
                            'name'                 => 'button-url',
                            'default'              => '',
                            'label'                => 'Button URL',
                            'help'                 => '',
                            'child_of'             => '',
                            'placement'            => 'inspector',
                            'width'                => '100',
                            'hide_if_not_selected' => 'false',
                            'save_in_meta'         => 'false',
                            'save_in_meta_name'    => '',
                            'required'             => 'false',
                            'placeholder'          => '',
                            'characters_limit'     => '',
                        ),
                    ),
                    'lazyblocks_slug'                   => 'example-block',
                    'lazyblocks_icon'                   => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.25" width="15" height="15" rx="4" transform="matrix(-1 0 0 1 22 7)" fill="currentColor" /><rect width="15" height="15" rx="4" transform="matrix(-1 0 0 1 17 2)" fill="currentColor" /></svg>',
                    'lazyblocks_description'            => esc_html__( 'Example block that helps you to get started with Lazy Blocks plugin', 'lazy-blocks' ),
                    'lazyblocks_keywords'               => 'example,sample,template',
                    'lazyblocks_category'               => 'design',
                    'lazyblocks_code_output_method'     => 'php',
                    'lazyblocks_code_show_preview'      => 'always',
                    'lazyblocks_code_single_output'     => 'true',
                    'lazyblocks_code_frontend_html'     => $code,
                    'lazyblocks_supports_multiple'      => 'true',
                    'lazyblocks_supports_classname'     => 'true',
                    'lazyblocks_supports_anchor'        => 'false',
                )
            );

            update_option( self::$option_name, $post_id );
        }
    }
}

new LazyBlocks_Dummy();
