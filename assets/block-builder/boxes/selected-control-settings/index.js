/**
 * Styles.
 */
import './editor.scss';

import { PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import SettingsRows from './settings-rows';

export default function SelectedControlSettings() {
	const id = useSelect(
		(select) => select('lazy-blocks/block-data').getSelectedControlId(),
		[]
	);

	const data = useSelect(
		(select) => select('lazy-blocks/block-data').getSelectedControl(),
		[]
	);

	const { updateControlData } = useDispatch('lazy-blocks/block-data');

	return (
		<div className="lzb-block-builder-controls-item-settings">
			{id && data ? (
				<SettingsRows
					updateData={(newData, optionalId = false) => {
						updateControlData(optionalId || id, newData);
					}}
					data={data}
					id={id}
				/>
			) : (
				<PanelBody>
					{__('Select control to see settings.', 'lazy-blocks')}
				</PanelBody>
			)}
		</div>
	);
}
