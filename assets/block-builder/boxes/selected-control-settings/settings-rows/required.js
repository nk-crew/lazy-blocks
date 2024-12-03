/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl, ToggleControl } from '@wordpress/components';

export default function RequiredRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-required"
				label={__('Required', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<ToggleControl
					id="lazyblocks-settings-row-required"
					label={__('Yes', 'lazy-blocks')}
					checked={data.required === 'true'}
					onChange={(value) =>
						updateData({ required: value ? 'true' : 'false' })
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</PanelBody>
	);
}
