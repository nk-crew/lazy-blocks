/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl, SelectControl } from '@wordpress/components';

export default function GroupRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-group"
				label={__('Group', 'lazy-blocks')}
			>
				<SelectControl
					id="lazyblocks-settings-row-group"
					value={data.group}
					options={[
						{ label: 'Default', value: 'default' },
						{ label: 'Styles', value: 'styles' },
						{ label: 'Advanced', value: 'advanced' },
					]}
					onChange={(value) =>
						updateData({
							group: value,
						})
					}
				/>
			</BaseControl>
		</PanelBody>
	);
}
