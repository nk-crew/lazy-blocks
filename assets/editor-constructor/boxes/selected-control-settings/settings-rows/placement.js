/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	BaseControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../../utils/get-control-type-data';

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

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-placement"
				label={__('Placement', 'lazy-blocks')}
			>
				<div />
				<ButtonGroup>
					<Button
						id="lazyblocks-settings-row-placement"
						isPrimary={
							placement === 'content' || placement === 'both'
						}
						isPressed={
							placement === 'content' || placement === 'both'
						}
						disabled={
							placementRestrictions.indexOf('content') === -1
						}
						size="small"
						onClick={() => {
							let newPlacement = 'content';

							if (placement === 'both') {
								newPlacement = 'inspector';
							} else if (placement === 'content') {
								newPlacement = 'nowhere';
							} else if (placement === 'inspector') {
								newPlacement = 'both';
							}

							updateData({
								placement: newPlacement,
							});
						}}
					>
						{__('Content', 'lazy-blocks')}
					</Button>
					<Button
						isPrimary={
							placement === 'inspector' || placement === 'both'
						}
						isPressed={
							placement === 'inspector' || placement === 'both'
						}
						disabled={
							placementRestrictions.indexOf('inspector') === -1
						}
						size="small"
						onClick={() => {
							let newPlacement = 'inspector';

							if (placement === 'both') {
								newPlacement = 'content';
							} else if (placement === 'inspector') {
								newPlacement = 'nowhere';
							} else if (placement === 'content') {
								newPlacement = 'both';
							}

							updateData({
								placement: newPlacement,
							});
						}}
					>
						{__('Inspector', 'lazy-blocks')}
					</Button>
				</ButtonGroup>
			</BaseControl>
		</PanelBody>
	);
}
