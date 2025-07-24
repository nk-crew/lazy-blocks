<?php
/**
 * PHPUnit 12 bootstrap file
 */

// Debug settings
if ( ! defined( 'LOCAL_WP_DEBUG_LOG' ) ) {
    define( 'LOCAL_WP_DEBUG_LOG', true );
}
if ( ! defined( 'LOCAL_WP_DEBUG_DISPLAY' ) ) {
    define( 'LOCAL_WP_DEBUG_DISPLAY', true );
}
if ( ! defined( 'LOCAL_SCRIPT_DEBUG' ) ) {
    define( 'LOCAL_SCRIPT_DEBUG', true );
}
if ( ! defined( 'LOCAL_WP_ENVIRONMENT_TYPE' ) ) {
    define( 'LOCAL_WP_ENVIRONMENT_TYPE', 'local' );
}

// Set up WordPress test environment
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Load WordPress test functions
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
    require dirname( dirname( dirname( __FILE__ ) ) ) . '/lazy-blocks.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Load WordPress
require $_tests_dir . '/includes/bootstrap.php';

// Load the WP_UnitTestCase from WordPress manually for PHPUnit 12
if ( ! class_exists( 'WP_UnitTestCase' ) ) {
    require_once $_tests_dir . '/includes/testcase.php';
}
