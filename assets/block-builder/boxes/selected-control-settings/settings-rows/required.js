/**
 * WordPress dependencies.
 */

import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function RequiredRow(props) {
	const { updateData, data } = props;

	return (
		<ToggleControl
			label={__('Required', 'lazy-blocks')}
			help={__(
				'The post cannot be saved while this field is empty.',
				'lazy-blocks'
			)}
			checked={data.required === 'true'}
			onChange={(value) =>
				updateData({ required: value ? 'true' : 'false' })
			}
			__nextHasNoMarginBottom
		/>
	);
}
