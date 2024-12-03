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

	const isContent = placement === 'content' || placement === 'both';
	const isInspector = placement === 'inspector' || placement === 'both';

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-placement"
				label={__('Placement', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<div />
				<ButtonGroup>
					<Button
						id="lazyblocks-settings-row-placement"
						variant={isContent ? 'primary' : ''}
						isPressed={isContent}
						disabled={
							!isContent &&
							placementRestrictions.indexOf('content') === -1
						}
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
						variant={isInspector ? 'primary' : ''}
						isPressed={isInspector}
						disabled={
							!isInspector &&
							placementRestrictions.indexOf('inspector') === -1
						}
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
