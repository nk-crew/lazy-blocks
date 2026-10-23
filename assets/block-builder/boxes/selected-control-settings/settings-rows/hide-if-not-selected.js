/**
 * WordPress dependencies.
 */

import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function HideIfNotSelectedRow(props) {
	const { updateData, data } = props;

	return (
		<ToggleControl
			label={__('Hide until the block is selected', 'lazy-blocks')}
			checked={data.hide_if_not_selected === 'true'}
			onChange={(value) =>
				updateData({
					hide_if_not_selected: value ? 'true' : 'false',
				})
			}
			__nextHasNoMarginBottom
		/>
	);
}
