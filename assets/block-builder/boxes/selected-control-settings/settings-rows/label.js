/**
 * External dependencies.
 */

import { PanelBody, TextControl } from '@wordpress/components';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import slugify from 'slugify';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../../utils/get-control-type-data';
import { getLabelUpdate } from '../../controls/control-types';

export default function LabelRow(props) {
	const { updateData, data, id } = props;

	function generateUniqueName() {
		const { label = '', name = '' } = data;

		if (!label || name) {
			return;
		}

		updateData({
			name: slugify(label, {
				replacement: '-',
				lower: true,
				remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
			}),
		});
	}

	const { label = '', placeholder, alongside_text: alongsideText } = data;

	const controlTypeData = getControlTypeData(data.type);
	const allowNameUpdate = controlTypeData.restrictions.name_settings;

	return (
		<PanelBody>
			<TextControl
				id="lazyblocks-settings-row-label"
				label={__('Label', 'lazy-blocks')}
				help={__(
					'This is the name which will appear on the block edit control',
					'lazy-blocks'
				)}
				placeholder={
					placeholder ||
					alongsideText ||
					__('(no label)', 'lazy-blocks')
				}
				value={label}
				onChange={(value) =>
					updateData(getLabelUpdate(id, data, value))
				}
				onBlur={allowNameUpdate ? generateUniqueName : () => {}}
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus
			/>
		</PanelBody>
	);
}
