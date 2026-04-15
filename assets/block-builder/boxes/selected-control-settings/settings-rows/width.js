/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	BaseControl,
	ToggleGroupControl as StableToggleGroupControl,
	ToggleGroupControlOption as StableToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption,
} from '@wordpress/components';

const ToggleGroupControl =
	StableToggleGroupControl || __experimentalToggleGroupControl;
const ToggleGroupControlOption =
	StableToggleGroupControlOption || __experimentalToggleGroupControlOption;

export default function WidthRow(props) {
	const { updateData, data } = props;

	const widths = {
		25: __('25%', 'lazy-blocks'),
		50: __('50%', 'lazy-blocks'),
		75: __('75%', 'lazy-blocks'),
		100: __('100%', 'lazy-blocks'),
	};

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-width"
				label={__('Width', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<div />
				<ToggleGroupControl
					value={data.width || '100'}
					onChange={(value) => updateData({ width: value })}
					isBlock
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				>
					{Object.keys(widths).map((w) => (
						<ToggleGroupControlOption
							key={w}
							value={w}
							label={widths[w]}
						/>
					))}
				</ToggleGroupControl>
			</BaseControl>
		</PanelBody>
	);
}
