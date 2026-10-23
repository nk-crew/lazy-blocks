/**
 * WordPress dependencies.
 */

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption,
	ToggleGroupControl as StableToggleGroupControl,
	ToggleGroupControlOption as StableToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../../utils/get-control-type-data';

const ToggleGroupControl =
	StableToggleGroupControl || __experimentalToggleGroupControl;
const ToggleGroupControlOption =
	StableToggleGroupControlOption || __experimentalToggleGroupControlOption;

export default function PlacementRow(props) {
	const { updateData, data } = props;

	const { placement = 'content' } = data;

	const controlTypeData = getControlTypeData(data.type);

	// check restrictions.
	let placementRestrictions = [];

	if (
		controlTypeData &&
		typeof controlTypeData.restrictions.placement_settings !== 'undefined'
	) {
		placementRestrictions = controlTypeData.restrictions.placement_settings;
	}

	if (!placementRestrictions.length) {
		return null;
	}

	const allowContent = placementRestrictions.includes('content');
	const allowInspector = placementRestrictions.includes('inspector');

	// The current placement stays listed even when a restriction excludes it.
	const options = [
		{
			value: 'content',
			label: __('Content', 'lazy-blocks'),
			allow: allowContent,
		},
		{
			value: 'inspector',
			label: __('Inspector', 'lazy-blocks'),
			allow: allowInspector,
		},
		{
			value: 'both',
			label: __('Both', 'lazy-blocks'),
			allow: allowContent && allowInspector,
		},
		{
			value: 'nowhere',
			label: __('Hidden', 'lazy-blocks'),
			allow: true,
		},
	].filter((option) => option.allow || option.value === placement);

	return (
		<ToggleGroupControl
			label={__('Placement', 'lazy-blocks')}
			value={placement}
			onChange={(value) => updateData({ placement: value })}
			isBlock
			__nextHasNoMarginBottom
		>
			{options.map((option) => (
				<ToggleGroupControlOption
					key={option.value}
					value={option.value}
					label={option.label}
				/>
			))}
		</ToggleGroupControl>
	);
}
