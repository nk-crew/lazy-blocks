<?php
/**
 * Pins the frontend output of the useBlockProps wrapper and <InnerBlocks /> parsing.
 *
 * Every row renders a real template through do_blocks(). The expected values were
 * recorded from the regex parser shipped in 4.4.2. Rows marked "Fixed" were broken
 * there, rows marked "Changed" differ for another reason; both name the 4.4.2 output.
 */
class BlockWrapperParsingTest extends WP_UnitTestCase {
	const SLUG = 'lazyblock/test';

	public function tear_down() {
		$registry = WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( self::SLUG ) ) {
			$registry->unregister( self::SLUG );
		}

		lazyblocks()->blocks()->remove_block( self::SLUG );

		parent::tear_down();
	}

	private function render( $template, $block_comment_attrs = '', $inner = '' ) {
		lazyblocks()->add_block(
			array(
				'slug'     => self::SLUG,
				'supports' => array(
					'customClassName' => true,
					'anchor'          => true,
					'align'           => array( 'wide', 'full' ),
				),
				'controls' => array(
					'control-1' => array(
						'type' => 'text',
						'name' => 'v',
					),
					'control-2' => array(
						'type'      => 'inner_blocks',
						'name'      => 'inner-content',
						'placement' => 'content',
					),
				),
				'code'     => array(
					'frontend_html' => $template,
				),
			)
		);
		lazyblocks()->blocks()->register_block_render();

		$attrs = $block_comment_attrs ? ' ' . $block_comment_attrs : '';

		if ( $inner ) {
			$markup = '<!-- wp:lazyblock/test' . $attrs . ' -->' . $inner . '<!-- /wp:lazyblock/test -->';
		} else {
			$markup = '<!-- wp:lazyblock/test' . $attrs . ' /-->';
		}

		// Core paragraph class differs between WordPress versions.
		return str_replace( ' class="wp-block-paragraph"', '', do_blocks( $markup ) );
	}

	public static function rows() {
		$inner = '<!-- wp:paragraph --><p>In</p><!-- /wp:paragraph -->';

		return array(
			// useBlockProps wrapper.
			'no marker'                     => array( '<p>Hi</p>', '', '', '<div class="wp-block-lazyblock-test"><p>Hi</p></div>' ),
			'marker only'                   => array( '<div useBlockProps>Hi</div>', '', '', '<div class="wp-block-lazyblock-test">Hi</div>' ),
			'class double quotes'           => array( '<div useBlockProps class="a b">Hi</div>', '', '', '<div class="a b wp-block-lazyblock-test">Hi</div>' ),
			'class single quotes'           => array( "<div useBlockProps class='a b'>Hi</div>", '', '', '<div class="a b wp-block-lazyblock-test">Hi</div>' ),
			'class without quotes'          => array( '<div useBlockProps class=a>Hi</div>', '', '', '<div class="a wp-block-lazyblock-test">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test">Hi</div>
			'marker between attributes'     => array( '<div class="a" useBlockProps id="x">Hi</div>', '', '', '<div class="a wp-block-lazyblock-test" id="x">Hi</div>' ),
			'marker last'                   => array( '<section class="a" id="x" data-test="t" useBlockProps>Hi</section>', '', '', '<section class="a wp-block-lazyblock-test" id="x" data-test="t">Hi</section>' ),
			'style and data'                => array( '<figure useBlockProps class="test-custom-class" data-test="hello" style="background-color: red; color: blue;">Hello There</figure>', '', '', '<figure style="background-color: red;color: blue" class="test-custom-class wp-block-lazyblock-test" data-test="hello">Hello There</figure>' ),
			'multiline tag'                 => array( "<div\n\tuseBlockProps\n\tclass=\"a\"\n\tdata-x=\"1\"\n>Hi</div>", '', '', '<div class="a wp-block-lazyblock-test" data-x="1">Hi</div>' ),
			'nested tags'                   => array( '<section useBlockProps class="outer"><div class="inner"><span>x</span></div></section>', '', '', '<section class="outer wp-block-lazyblock-test"><div class="inner"><span>x</span></div></section>' ),
			'marker not on first tag'       => array( '<p>before</p><div useBlockProps class="a">x</div><p>after</p>', '', '', '<p>before</p><div class="a wp-block-lazyblock-test">x</div><p>after</p>' ),
			'uppercase attribute names'     => array( '<div useBlockProps CLASS="a" Data-Foo="b">Hi</div>', '', '', '<div class="a wp-block-lazyblock-test" data-foo="b">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" CLASS="a" Data-Foo="b">Hi</div>
			'uppercase tag name'            => array( '<DIV useBlockProps class="a">Hi</DIV>', '', '', '<DIV class="a wp-block-lazyblock-test">Hi</DIV>' ),
			'self-closing tag'              => array( '<img useBlockProps src="https://example.com/a.jpg" alt="x" />', '', '', '<img class="wp-block-lazyblock-test" src="https://example.com/a.jpg" alt="x">' ),
			'boolean attribute'             => array( '<details useBlockProps open class="a"><summary>s</summary></details>', '', '', '<details class="a wp-block-lazyblock-test" open=""><summary>s</summary></details>' ), // Fixed: 4.4.2 gave <details class="a wp-block-lazyblock-test"><summary>s</summary></details>
			'own id wins over anchor'       => array( '<div useBlockProps class="a" id="mine">Hi</div>', '{"anchor":"anc","className":"cc","align":"wide"}', '', '<div class="a alignwide cc wp-block-lazyblock-test" id="mine">Hi</div>' ),
			'anchor, class name, align'     => array( '<div useBlockProps class="a">Hi</div>', '{"anchor":"anc","className":"cc","align":"wide"}', '', '<div class="a alignwide cc wp-block-lazyblock-test" id="anc">Hi</div>' ),
			'auto wrapper with block attrs' => array( '<p>Hi</p>', '{"anchor":"anc","className":"cc","align":"full"}', '', '<div class="alignfull cc wp-block-lazyblock-test" id="anc"><p>Hi</p></div>' ),
			'entity in value'               => array( '<div useBlockProps title="Tom &amp; Jerry" class="a">Hi</div>', '', '', '<div class="a wp-block-lazyblock-test" title="Tom &amp; Jerry">Hi</div>' ),
			'named entity in value'         => array( '<div useBlockProps title="a&nbsp;b">Hi</div>', '', '', "<div class=\"wp-block-lazyblock-test\" title=\"a\u{00A0}b\">Hi</div>" ), // Changed: the value is decoded and re-escaped, &nbsp; becomes U+00A0. 4.4.2 gave <div class="wp-block-lazyblock-test" title="a&nbsp;b">Hi</div>
			'handlebars value in attribute' => array( '<div useBlockProps data-v="{{v}}">Hi</div>', '{"v":"a=b\'s"}', '', '<div class="wp-block-lazyblock-test" data-v="a=b&#039;s">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" data-v="a=b">Hi</div>
			'two marked tags'               => array( '<div useBlockProps class="a">1</div><div useBlockProps class="b">2</div>', '', '', '<div class="a wp-block-lazyblock-test">1</div><div class="b wp-block-lazyblock-test">2</div>' ), // Fixed: 4.4.2 gave <div class="a wp-block-lazyblock-test">1</div><div class="a wp-block-lazyblock-test">2</div>
			'marker text inside a value'    => array( '<div title="no useBlockProps here">Hi</div>', '', '', '<div class="wp-block-lazyblock-test"><div title="no useBlockProps here">Hi</div></div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" title="no  here">Hi</div>
			'lowercase marker'              => array( '<div useblockprops class="a">Hi</div>', '', '', '<div class="a wp-block-lazyblock-test">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test"><div useblockprops class="a">Hi</div></div>
			'custom element'                => array( '<my-card useBlockProps class="a">Hi</my-card>', '', '', '<my-card class="a wp-block-lazyblock-test">Hi</my-card>' ), // Fixed: 4.4.2 gave <my class="a wp-block-lazyblock-test">Hi</my-card>
			// Broken in 4.4.2: directive names, quoted JSON, look-alike names, '>' in a value.
			'interactivity directive'       => array( '<div useBlockProps data-wp-interactive="ns" data-wp-on--click="actions.toggle">Hi</div>', '', '', '<div class="wp-block-lazyblock-test" data-wp-interactive="ns" data-wp-on--click="actions.toggle">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" data-wp-interactive="ns" click="actions.toggle">Hi</div>
			'json in single quotes'         => array( '<div useBlockProps data-wp-context=\'{"open":false}\'>Hi</div>', '', '', '<div class="wp-block-lazyblock-test" data-wp-context="{&quot;open&quot;:false}">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" data-wp-context="{">Hi</div>
			'alpine directive'              => array( '<div useBlockProps x-on:click="open = !open">Hi</div>', '', '', '<div class="wp-block-lazyblock-test" x-on:click="open = !open">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" click="open = !open">Hi</div>
			'data-class is not class'       => array( '<div useBlockProps data-class="x">Hi</div>', '', '', '<div class="wp-block-lazyblock-test" data-class="x">Hi</div>' ), // Fixed: 4.4.2 gave <div class="x wp-block-lazyblock-test" data-class="x">Hi</div>
			'data-id is not id'             => array( '<div useBlockProps data-id="5">Hi</div>', '', '', '<div class="wp-block-lazyblock-test" data-id="5">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test" id="5" data-id="5">Hi</div>
			'greater-than in value'         => array( '<div useBlockProps data-cond="a > b" class="a">Hi</div>', '', '', '<div class="a wp-block-lazyblock-test" data-cond="a &gt; b">Hi</div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test"> b" class="a">Hi</div>
			// <InnerBlocks /> wrapper class.
			'inner blocks plain'            => array( '<InnerBlocks />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="lazyblock-inner-blocks"><p>In</p></div></div>' ),
			'inner blocks className'        => array( '<InnerBlocks className="custom" />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="custom"><p>In</p></div></div>' ),
			'inner blocks class'            => array( '<InnerBlocks class="c1 c2" />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="c1 c2"><p>In</p></div></div>' ),
			'inner blocks single quotes'    => array( "<InnerBlocks className='s' />", '', $inner, '<div class="wp-block-lazyblock-test"><div class="s"><p>In</p></div></div>' ),
			'inner blocks multiline'        => array( "<InnerBlocks\n\tallowedBlocks=\"[&quot;core/paragraph&quot;]\"\n\tclassName=\"m\"\n/>", '', $inner, '<div class="wp-block-lazyblock-test"><div class="m"><p>In</p></div></div>' ),
			'inner blocks template attr'    => array( '<InnerBlocks template="[[&quot;core/paragraph&quot;]]" templateLock="all" />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="lazyblock-inner-blocks"><p>In</p></div></div>' ),
			'inner blocks in marked tag'    => array( '<div useBlockProps class="w"><InnerBlocks className="in" /></div>', '', $inner, '<div class="w wp-block-lazyblock-test"><div class="in"><p>In</p></div></div>' ),
			'inner blocks then class'       => array( '<InnerBlocks /><p class="after">x</p>', '', $inner, '<div class="wp-block-lazyblock-test"><div class="lazyblock-inner-blocks"><p>In</p></div><p class="after">x</p></div>' ),
			'inner blocks call expression'  => array( '<InnerBlocks className="{ cls(\'x\') }" />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="{ cls(&#039;x&#039;) }"><p>In</p></div></div>' ), // Changed: the raw value is used, as the editor does. 4.4.2 gave <div class="wp-block-lazyblock-test"><div class="x"><p>In</p></div></div>
			'inner blocks data-className'   => array( '<InnerBlocks data-className="x" />', '', $inner, '<div class="wp-block-lazyblock-test"><div class="lazyblock-inner-blocks"><p>In</p></div></div>' ), // Fixed: 4.4.2 gave <div class="wp-block-lazyblock-test"><div class="x"><p>In</p></div></div>
		);
	}

	/**
	 * @dataProvider rows
	 */
	public function test_wrapper_output( $template, $attrs, $inner, $expected ) {
		$this->assertSame( $expected, $this->render( $template, $attrs, $inner ) );
	}
}
