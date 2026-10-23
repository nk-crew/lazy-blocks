/* eslint-disable indent */
/**
 * WordPress dependencies.
 */

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem,
	BaseControl,
	Button,
	Notice,
	ToolsPanel as StableToolsPanel,
	ToolsPanelItem as StableToolsPanelItem,
	ToggleControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { sortByLabel } from '../supports';

const ToolsPanel = StableToolsPanel || __experimentalToolsPanel;
const ToolsPanelItem = StableToolsPanelItem || __experimentalToolsPanelItem;

// `needsClassName` supports turn on the Class Name support with them.
const GHOSTKIT_SUPPORTS = [
	{
		key: 'supports_ghostkit_effects',
		label: __('Effects', 'lazy-blocks'),
		help: __(
			'Add visual effects, reveal, scroll animations, etc.',
			'lazy-blocks'
		),
	},
	{
		key: 'supports_ghostkit_position',
		label: __('Position', 'lazy-blocks'),
		help: __(
			'Change block position to either absolute or fixed.',
			'lazy-blocks'
		),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_spacings',
		label: __('Spacings', 'lazy-blocks'),
		help: __('Change block margins and paddings.', 'lazy-blocks'),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_frame',
		label: __('Frame', 'lazy-blocks'),
		help: __('Add border and box shadow to block.', 'lazy-blocks'),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_transform',
		label: __('Transform', 'lazy-blocks'),
		help: __('Add CSS transformations to block.', 'lazy-blocks'),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_custom_css',
		label: __('Custom CSS', 'lazy-blocks'),
		help: __('Write custom CSS on each inserted blocks.', 'lazy-blocks'),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_display',
		label: __('Display', 'lazy-blocks'),
		help: __(
			'Display / Hide blocks on different screen sizes.',
			'lazy-blocks'
		),
		needsClassName: true,
	},
	{
		key: 'supports_ghostkit_attributes',
		label: __('Attributes', 'lazy-blocks'),
		help: __(
			'Insert custom HTML attributes with custom content.',
			'lazy-blocks'
		),
	},
];

function isEnabled(value) {
	return !!value && value !== 'false';
}

export default function SupportsGhostKitSettings(props) {
	const { data, updateData } = props;

	const {
		supports_classname: supportsClassname,

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
		<ToolsPanel
			className="lzb-block-builder-supports-ghost-kit"
			label={__('Supports Ghost Kit', 'lazy-blocks')}
			resetAll={() => {
				const reset = {};
				GHOSTKIT_SUPPORTS.forEach(({ key }) => {
					reset[key] = false;
				});
				updateData(reset);
			}}
		>
			{!window.GHOSTKIT ? (
				<BaseControl>
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
				<BaseControl>
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

			{sortByLabel(
				GHOSTKIT_SUPPORTS.map(
					({ key, label, help, needsClassName }) => (
						<ToolsPanelItem
							key={key}
							label={label}
							hasValue={() => isEnabled(data[key])}
							onDeselect={() => updateData({ [key]: false })}
						>
							<ToggleControl
								label={label}
								help={help}
								checked={isEnabled(data[key])}
								onChange={(value) =>
									updateData(
										needsClassName
											? {
													[key]: value,
													supports_classname:
														value ||
														supportsClassname,
												}
											: { [key]: value }
									)
								}
							/>
						</ToolsPanelItem>
					)
				)
			)}
		</ToolsPanel>
	);
}
