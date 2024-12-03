/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
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

		supports_ghostkit_effects: supportsGktEffects,
		supports_ghostkit_position: supportsGktPosition,
		supports_ghostkit_spacings: supportsGktSpacings,
		supports_ghostkit_frame: supportsGktFrame,
		supports_ghostkit_transform: supportsGktTransform,
		supports_ghostkit_custom_css: supportsGktCustomCSS,
		supports_ghostkit_display: supportsGktDisplay,
		supports_ghostkit_attributes: supportsGktAttributes,

		// Deprecated.
		supports_ghostkit_scroll_reveal: supportsGktScrollReveal,
	} = data;

	// Migrate old attribute.
	useEffect(() => {
		if (typeof supportsGktScrollReveal !== 'undefined') {
			updateData({
				supports_ghostkit_scroll_reveal: undefined,
				supports_ghostkit_effects: supportsGktScrollReveal,
			});
		}
	}, [supportsGktScrollReveal, updateData]);

	return (
		<>
			{!window.GHOSTKIT ? (
				<BaseControl __nextHasNoMarginBottom>
					<Notice
						isDismissible={false}
						className="lzb-block-builder-notice"
					>
						<p>
							{__(
								'To see these settings in your block, you have to install Ghost Kit plugin.',
								'lazy-blocks'
							)}
						</p>
						<Button
							variant="primary"
							size="small"
							href="https://wordpress.org/plugins/ghostkit/"
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Read More', 'lazy-blocks')}
						</Button>
					</Notice>
				</BaseControl>
			) : null}

			{(supportsGktPosition ||
				supportsGktSpacings ||
				supportsGktDisplay ||
				supportsGktFrame ||
				supportsGktTransform ||
				supportsGktCustomCSS ||
				supportsGktAttributes) &&
			!supportsClassname ? (
				<BaseControl __nextHasNoMarginBottom>
					<Notice
						status="error"
						isDismissible={false}
						className="lzb-block-builder-notice"
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
				label={__('Effects', 'lazy-blocks')}
				help={__(
					'Add visual effects, reveal, scroll animations, etc.',
					'lazy-blocks'
				)}
				checked={supportsGktEffects}
				onChange={(value) =>
					updateData({
						supports_ghostkit_effects: value,
					})
				}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Position', 'lazy-blocks')}
				help={__(
					'Change block position to either absolute or fixed.',
					'lazy-blocks'
				)}
				checked={supportsGktPosition}
				onChange={(value) =>
					updateData({
						supports_ghostkit_position: value,
						supports_classname: value || supportsClassname,
					})
				}
				__nextHasNoMarginBottom
			/>
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
				__nextHasNoMarginBottom
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
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Transform', 'lazy-blocks')}
				help={__('Add CSS transformations to block.', 'lazy-blocks')}
				checked={supportsGktTransform}
				onChange={(value) =>
					updateData({
						supports_ghostkit_transform: value,
						supports_classname: value || supportsClassname,
					})
				}
				__nextHasNoMarginBottom
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
				__nextHasNoMarginBottom
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
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Attributes', 'lazy-blocks')}
				help={__(
					'Insert custom HTML attributes with custom content.',
					'lazy-blocks'
				)}
				checked={supportsGktAttributes}
				onChange={(value) =>
					updateData({ supports_ghostkit_attributes: value })
				}
				__nextHasNoMarginBottom
			/>
		</>
	);
}
