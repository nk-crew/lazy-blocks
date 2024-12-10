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
				__nextHasNoMarginBottom
			>
				<ToggleControl
					id="lazyblocks-settings-row-wpml"
					label={__('Yes', 'lazy-blocks')}
					checked={data.translate === 'true'}
					onChange={(value) =>
						updateData({ translate: value ? 'true' : 'false' })
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</PanelBody>
	);
}
