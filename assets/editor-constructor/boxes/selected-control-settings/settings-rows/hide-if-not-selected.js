/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl, ToggleControl } from '@wordpress/components';

export default function HideIfNotSelectedRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-hide-if-no-selected"
				label={__('Hide if block is not selected', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<ToggleControl
					id="lazyblocks-settings-row-hide-if-no-selected"
					label={__('Yes', 'lazy-blocks')}
					checked={data.hide_if_not_selected === 'true'}
					onChange={(value) =>
						updateData({
							hide_if_not_selected: value ? 'true' : 'false',
						})
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</PanelBody>
	);
}
