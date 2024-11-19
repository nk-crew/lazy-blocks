<?php
/**
 * LazyBlocks Handlebars.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LazyBlocks_Handlebars class. Class to work with LazyBlocks Handlebars.
 */
class LazyBlocks_Handlebars {
	/**
	 * Handlebars engine.
	 *
	 * @var null|object
	 */
	public $object = null;

	/**
	 * LazyBlocks_Handlebars constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'prepare' ) );
	}

	/**
	 * Check if the attribute is a handlebars options attribute.
	 *
	 * @param mixed $attribute The attribute to check.
	 * @return bool True if the attribute is a handlebars options attribute, false otherwise.
	 */
	public function is_handlebars_options_attribute( $attribute ) {
		return is_array( $attribute ) && isset( $attribute['data']['index'] ) && isset( $attribute['context'] );
	}

	/**
	 * Prepare Handlebars php.
	 */
	public function prepare() {
		require_once lazyblocks()->plugin_path() . 'vendors/Handlebars/Autoloader.php';

		Handlebars\Autoloader::register();

		$this->object = new Handlebars\Handlebars();

		// truncate
		// {{truncate 'string' 2 'true'}}.
		$this->object->registerHelper(
			'truncate',
			function( $str, $len, $ellipsis = 'true' ) {
				if ( $str && $len && mb_strlen( $str, 'UTF-8' ) > $len ) {
					$new_str = mb_substr( $str, 0, $len + 1, 'UTF-8' );
					$count   = mb_strlen( $new_str, 'UTF-8' );

					while ( $count > 0 ) {
						$ch      = mb_substr( $new_str, -1, null, 'UTF-8' );
						$new_str = mb_substr( $new_str, 0, -1, 'UTF-8' );

						$count--;

						if ( ' ' === $ch ) {
							break;
						}
					}

					if ( '' === $new_str ) {
						$new_str = mb_substr( $str, 0, $len, 'UTF-8' );
					}

					return new \Handlebars\SafeString( $new_str . ( 'true' === $ellipsis ? '...' : '' ) );
				}
				return $str;
			}
		);

		// compare.
		// {{#compare 1 '===' 2}} Show if true {{/compare}}
		// slightly changed https://gist.github.com/doginthehat/1890659.
		$this->object->registerHelper(
			'compare',
			function( $lvalue, $operator, $rvalue = null, $options = null ) {
				if ( null === $rvalue ) {
					return $options['inverse']();
				}

				if ( null === $options ) {
					$options  = $rvalue;
					$rvalue   = $operator;
					$operator = '===';
				}

				$result = false;

				switch ( $operator ) {
					case '==':
						// phpcs:ignore
						$result = $lvalue == $rvalue;
						break;
					case '===':
						$result = $lvalue === $rvalue;
						break;
					case '!=':
						// phpcs:ignore
						$result = $lvalue != $rvalue;
						break;
					case '!==':
						$result = $lvalue !== $rvalue;
						break;
					case '<':
						$result = $lvalue < $rvalue;
						break;
					case '>':
						$result = $lvalue > $rvalue;
						break;
					case '<=':
						$result = $lvalue <= $rvalue;
						break;
					case '>=':
						$result = $lvalue >= $rvalue;
						break;
					case '&&':
						$result = $lvalue && $rvalue;
						break;
					case '||':
						$result = $lvalue || $rvalue;
						break;
					case 'typeof':
						$result = gettype( $lvalue ) === $rvalue;
						break;
				}

				if ( $result ) {
					return $options['fn']();
				}

				return $options['inverse']();
			}
		);

		// math.
		// {{math 1 '+' 2}}
		// https://stackoverflow.com/questions/33059203/error-missing-helper-in-handlebars-js/46317662#46317662.
		$this->object->registerHelper(
			'math',
			function( $lvalue, $operator, $rvalue ) {
				$result = '';

				switch ( $operator ) {
					case '+':
						$result = $lvalue + $rvalue;
						break;
					case '-':
						$result = $lvalue - $rvalue;
						break;
					case '*':
						$result = $lvalue * $rvalue;
						break;
					case '/':
						$result = $lvalue / $rvalue;
						break;
					case '%':
						$result = $lvalue % $rvalue;
						break;
				}

				return $result;
			}
		);

		// do_shortcode.
		// {{{do_shortcode 'my_shortcode' this}}}.
		$this->object->registerHelper(
			'do_shortcode',
			function( $shortcode_name, $attributes ) {
				$result = '[' . $shortcode_name;

				// prepare attributes.
				if ( isset( $attributes ) && ! empty( $attributes ) ) {
					foreach ( $attributes as $name => $val ) {
						if (
						'content' === $name
						|| 'lazyblock_code_frontend_html' === $name
						|| 'lazyblock_code_backend_html' === $name
						|| 'data' === $name
						|| 'hash' === $name
						) {
							continue;
						}

						if ( is_array( $val ) ) {
							$val = wp_json_encode( $val );
						}

						if (
						! is_numeric( $val )
						&& ! is_string( $val )
						&& ! is_bool( $val )
						) {
							continue;
						}

						if ( is_bool( $val ) ) {
							$val = $val ? '1' : '0';
						}

						$result .= ' ' . esc_attr( $name ) . '="' . esc_attr( $val ) . '"';
					}

					// content.
					if ( isset( $attributes['content'] ) ) {
						$result .= ']' . $attributes['content'] . '[/' . $shortcode_name;
					}
				}

				$result .= ']';

				return do_shortcode( $result );
			}
		);

		// date_i18n.
		// {{date_i18n 'F j, Y H:i' '2018-09-16 15:35'}}.
		$this->object->registerHelper(
			'date_i18n',
			function( $format, $time ) {
				return date_i18n( $format, strtotime( $time ) );
			}
		);

		// var_dump.
		// {{var_dump 'test'}}.
		$this->object->registerHelper(
			'var_dump',
			function( $val ) {
				ob_start();
				var_dump( $val );
				return ob_get_clean();
			}
		);

		// wp_get_attachment_image.
		// {{wp_get_attachment_image 123 'thumbnail'}}.
		$this->object->registerHelper(
			'wp_get_attachment_image',
			function( $attachment_id, $size = 'thumbnail', $icon = false, $attr = '' ) {
				// Prevent options from being passed.
				// Add default values if options are not set.
				if ( ! isset( $size ) || $this->is_handlebars_options_attribute( $size ) ) {
					$size = 'thumbnail';
				}
				if ( ! isset( $icon ) || $this->is_handlebars_options_attribute( $icon ) ) {
					$icon = false;
				}
				if ( ! isset( $attr ) || $this->is_handlebars_options_attribute( $attr ) ) {
					$attr = '';
				}

				if ( is_array( $attachment_id ) && isset( $attachment_id['id'] ) ) {
					if ( ! empty( $attachment_id['id'] ) ) {
						return wp_get_attachment_image( $attachment_id['id'], $size, $icon, $attr );
					} elseif ( isset( $attachment_id['url'] ) ) {
						return '<img src="' . esc_url( $attachment_id['url'] ) . '" alt="' . esc_attr( $attr ) . '">';
					}
				} elseif ( is_numeric( $attachment_id ) || is_string( $attachment_id ) && ! empty( $attachment_id ) ) {
					return wp_get_attachment_image( $attachment_id, $size, $icon, $attr );
				}

				return '';
			}
		);

		// custom action for extending default helpers by 3rd-party.
		do_action( 'lzb/handlebars/object', $this->object );
	}
}
