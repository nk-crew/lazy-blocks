/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	Notice,
	BaseControl,
	Button,
	ToggleControl,
} from '@wordpress/components';

export default function SupportsGhostKitSettings(props) {
	const { data, updateData } = props;

	const {
		supports_classname: supportsClassname,

		supports_ghostkit_spacings: supportsGktSpacings,
		supports_ghostkit_display: supportsGktDisplay,
		supports_ghostkit_scroll_reveal: supportsGktScrollReveal,
		supports_ghostkit_frame: supportsGktFrame,
		supports_ghostkit_custom_css: supportsGktCustomCSS,
	} = data;

	return (
		<>
			{!window.GHOSTKIT ? (
				<BaseControl>
					<Notice
						isDismissible={false}
						className="lzb-constructor-notice"
					>
						<p>
							{__(
								'To see these settings in your block, you have to install Ghost Kit plugin.',
								'lazy-blocks'
							)}
						</p>
						<Button
							isPrimary
							isSmall
							href="https://wordpress.org/plugins/ghostkit/"
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Read More', 'lazy-blocks')}
						</Button>
					</Notice>
				</BaseControl>
			) : null}

			{(supportsGktSpacings ||
				supportsGktDisplay ||
				supportsGktFrame ||
				supportsGktCustomCSS) &&
			!supportsClassname ? (
				<BaseControl>
					<Notice
						status="error"
						isDismissible={false}
						className="lzb-constructor-notice"
					>
						<p>
							{__(
								'"Class Name" support is required to use the following settings.',
								'lazy-blocks'
							)}
						</p>
					</Notice>
				</BaseControl>
			) : null}

			<ToggleControl
				label={__('Spacings', 'lazy-blocks')}
				help={__('Change block margins and paddings.', 'lazy-blocks')}
				checked={supportsGktSpacings}
				onChange={(value) =>
					updateData({
						supports_ghostkit_spacings: value,
						supports_classname: value || supportsClassname,
					})
				}
			/>
			<ToggleControl
				label={__('Display', 'lazy-blocks')}
				help={__(
					'Display / Hide blocks on different screen sizes.',
					'lazy-blocks'
				)}
				checked={supportsGktDisplay}
				onChange={(value) =>
					updateData({
						supports_ghostkit_display: value,
						supports_classname: value || supportsClassname,
					})
				}
			/>
			<ToggleControl
				label={__('Animate on Scroll', 'lazy-blocks')}
				help={__(
					'Display block with animation on scroll.',
					'lazy-blocks'
				)}
				checked={supportsGktScrollReveal}
				onChange={(value) =>
					updateData({ supports_ghostkit_scroll_reveal: value })
				}
			/>
			<ToggleControl
				label={__('Frame', 'lazy-blocks')}
				help={__('Add border and box shadow to block.', 'lazy-blocks')}
				checked={supportsGktFrame}
				onChange={(value) =>
					updateData({
						supports_ghostkit_frame: value,
						supports_classname: value || supportsClassname,
					})
				}
			/>
			<ToggleControl
				label={__('Custom CSS', 'lazy-blocks')}
				help={__(
					'Write custom CSS on each inserted blocks.',
					'lazy-blocks'
				)}
				checked={supportsGktCustomCSS}
				onChange={(value) =>
					updateData({
						supports_ghostkit_custom_css: value,
						supports_classname: value || supportsClassname,
					})
				}
			/>
		</>
	);
}
