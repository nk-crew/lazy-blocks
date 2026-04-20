/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl, SelectControl } from '@wordpress/components';

export default function GroupRow(props) {
	const { updateData, data } = props;
	const groupValue =
		!data.group || data.group === 'default' ? 'settings' : data.group;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-group"
				label={__('Group', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblocks-settings-row-group"
					value={groupValue}
					options={[
						{ label: 'Settings', value: 'settings' },
						{ label: 'Styles', value: 'styles' },
						{ label: 'Advanced', value: 'advanced' },
						{ label: 'List View', value: 'list' },
					]}
					onChange={(value) =>
						updateData({
							group: value,
						})
					}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</PanelBody>
	);
}
