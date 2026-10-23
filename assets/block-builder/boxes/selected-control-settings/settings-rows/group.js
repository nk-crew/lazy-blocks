/**
 * WordPress dependencies.
 */

import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function GroupRow(props) {
	const { updateData, data } = props;
	const groupValue =
		!data.group || data.group === 'default' ? 'settings' : data.group;

	return (
		<SelectControl
			id="lazyblocks-settings-row-group"
			label={__('Group', 'lazy-blocks')}
			value={groupValue}
			options={[
				{ label: 'Settings', value: 'settings' },
				{ label: 'Content', value: 'content' },
				{ label: 'List View', value: 'list' },
				{ label: 'Styles', value: 'styles' },
				{ label: 'Advanced', value: 'advanced' },
			]}
			onChange={(value) =>
				updateData({
					group: value,
				})
			}
			__nextHasNoMarginBottom
		/>
	);
}
