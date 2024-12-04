/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import SettingsRows from './settings-rows';

export default function SelectedControlSettings() {
	const { id, data } = useSelect((select) => {
		const { getSelectedControlId, getSelectedControl } = select(
			'lazy-blocks/block-data'
		);

		return {
			id: getSelectedControlId(),
			data: getSelectedControl(),
		};
	}, []);

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
