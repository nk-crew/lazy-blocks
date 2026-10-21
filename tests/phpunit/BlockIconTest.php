<?php
/**
 * Block icon SVG sanitizing.
 */
class BlockIconTest extends WP_UnitTestCase {
	// Bundled Material icons such as "accessible" draw with <circle>.
	public function test_bundled_icon_with_circle_keeps_the_circle() {
		$icon = lazyblocks()->icons()->get_all()['action']['accessible'];

		$this->assertStringContainsString( '<circle cx="12" cy="4" r="2"/>', $icon );
		$this->assertStringContainsString( '<circle cx="12" cy="4" r="2" />', lazyblocks()->blocks()->prepare_block_icon( $icon ) );
	}

	public function test_stroke_icon_keeps_shapes_and_stroke_attributes() {
		$icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
			. '<circle cx="12" cy="12" r="10"/>'
			. '<ellipse cx="12" cy="12" rx="4" ry="2"/>'
			. '<line x1="2" y1="12" x2="22" y2="12"/>'
			. '<polyline points="1,1 2,2 3,1" stroke-miterlimit="4" stroke-dasharray="2"/>'
			. '<polygon points="1,1 2,2 3,1" fill-rule="evenodd" clip-rule="evenodd" fill-opacity="0.5" stroke-opacity="0.5"/>'
			. '</svg>';

		// wp_kses lowercases attribute names and writes self-closing tags as " />".
		$expected = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
			. '<circle cx="12" cy="12" r="10" />'
			. '<ellipse cx="12" cy="12" rx="4" ry="2" />'
			. '<line x1="2" y1="12" x2="22" y2="12" />'
			. '<polyline points="1,1 2,2 3,1" stroke-miterlimit="4" stroke-dasharray="2" />'
			. '<polygon points="1,1 2,2 3,1" fill-rule="evenodd" clip-rule="evenodd" fill-opacity="0.5" stroke-opacity="0.5" />'
			. '</svg>';

		$this->assertSame( $expected, lazyblocks()->blocks()->prepare_block_icon( $icon ) );
	}

	public function test_scripts_and_event_handlers_are_still_removed() {
		$icon = '<svg viewBox="0 0 24 24" onload="alert(1)"><script>alert(2)</script><circle cx="1" cy="1" r="1" onclick="alert(3)"/></svg>';

		$result = lazyblocks()->blocks()->prepare_block_icon( $icon );

		$this->assertSame( '<svg viewbox="0 0 24 24">alert(2)<circle cx="1" cy="1" r="1" /></svg>', $result );
	}
}
