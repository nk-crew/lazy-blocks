/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl, ToggleControl } from '@wordpress/components';

export default function WPMLRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-wpml"
				label={__('WPML Translation', 'lazy-blocks')}
			>
				<ToggleControl
					id="lazyblocks-settings-row-wpml"
					label={__('Yes', 'lazy-blocks')}
					help={__(
						'Experimental feature, may not work as expected.',
						'lazy-blocks'
					)}
					checked={data.translate === 'true'}
					onChange={(value) =>
						updateData({ translate: value ? 'true' : 'false' })
					}
				/>
			</BaseControl>
		</PanelBody>
	);
}
