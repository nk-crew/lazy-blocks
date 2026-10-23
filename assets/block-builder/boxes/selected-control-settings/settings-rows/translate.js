/**
 * WordPress dependencies.
 */

import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function WPMLRow(props) {
	const { updateData, data } = props;

	return (
		<ToggleControl
			label={__('Translate with WPML', 'lazy-blocks')}
			checked={data.translate === 'true'}
			onChange={(value) =>
				updateData({ translate: value ? 'true' : 'false' })
			}
			__nextHasNoMarginBottom
		/>
	);
}
