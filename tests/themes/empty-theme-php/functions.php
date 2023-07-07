<?php
/**
 * Empty theme functions and definitions.
 *
 * @package Gutenberg
 */

if ( ! function_exists( 'empty_theme_php_support' ) ) :
	/**
	 * Add theme support for various features.
	 */
	function empty_theme_php_support() {

		// Adding support for core block visual styles.
		add_theme_support( 'wp-block-styles' );

		// Enqueue editor styles.
		add_editor_style( 'style.css' );

		// Widgets area.
		register_sidebar( array(
			'name'          => __( 'Primary Sidebar', 'theme_name' ),
			'id'            => 'sidebar-1',
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget'  => '</aside>',
			'before_title'  => '<h3 class="widget-title">',
			'after_title'   => '</h3>',
		) );
	}
	add_action( 'after_setup_theme', 'empty_theme_php_support' );
endif;

/**
 * Enqueue scripts and styles.
 */
function empty_theme_php_scripts() {
	// Enqueue theme stylesheet.
	wp_enqueue_style( 'empty-theme-php-style', get_template_directory_uri() . '/style.css', array(), wp_get_theme()->get( 'Version' ) );
}

add_action( 'wp_enqueue_scripts', 'empty_theme_php_scripts' );
