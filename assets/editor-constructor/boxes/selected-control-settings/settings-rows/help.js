/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, TextareaControl } from '@wordpress/components';

export default function HelpRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<TextareaControl
				label={__('Help text', 'lazy-blocks')}
				help={__('Instructions under control', 'lazy-blocks')}
				value={data.help}
				onChange={(value) => updateData({ help: value })}
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);
}
