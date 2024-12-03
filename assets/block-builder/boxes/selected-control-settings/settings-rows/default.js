/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';

export default function DefaultRow(props) {
	const { updateData, data } = props;

	let ControlType = TextControl;

	switch (data.type) {
		case 'classic_editor':
		case 'code_editor':
		case 'rich_text':
		case 'textarea':
			ControlType = TextareaControl;
			break;
		// no default
	}

	return (
		<PanelBody>
			<ControlType
				label={__('Default value', 'lazy-blocks')}
				help={__('Appears when inserting a new block', 'lazy-blocks')}
				value={data.default}
				onChange={(value) => updateData({ default: value })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</PanelBody>
	);
}
