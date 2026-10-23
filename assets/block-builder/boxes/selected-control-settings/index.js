/**
 * Styles.
 */
import './editor.scss';

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem,
	PanelBody,
	ToolsPanel as StableToolsPanel,
	ToolsPanelItem as StableToolsPanelItem,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';
import getSettingsRows from './settings-rows';

const ToolsPanel = StableToolsPanel || __experimentalToolsPanel;
const ToolsPanelItem = StableToolsPanelItem || __experimentalToolsPanelItem;

const BEHAVIOR_LABELS = {
	required: __('Required', 'lazy-blocks'),
	hide_if_not_selected: __('Hide until the block is selected', 'lazy-blocks'),
	translate: __('Translate with WPML', 'lazy-blocks'),
	save_in_meta: __('Save in post meta', 'lazy-blocks'),
};

/**
 * Icon, label and type of the selected control.
 *
 * @param {Object}   props
 * @param {Object}   props.rowProps Props passed to every settings row.
 * @param {Function} props.TypeRow  Type switch, when the type can be changed.
 */
function ControlHeader({ rowProps, TypeRow }) {
	const { data } = rowProps;
	const controlTypeData = getControlTypeData(data.type);

	return (
		<div className="lzb-block-builder-control-card">
			<span
				className="lzb-block-builder-control-card-icon"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: controlTypeData.icon }}
			/>
			<div className="lzb-block-builder-control-card-content">
				<h2 className="lzb-block-builder-control-card-title">
					{(controlTypeData.restrictions.label_settings &&
						data.label) ||
						__('(no label)', 'lazy-blocks')}
				</h2>
				{TypeRow ? (
					<TypeRow {...rowProps} />
				) : (
					<span className="lzb-block-builder-control-card-type">
						{controlTypeData.label}
					</span>
				)}
			</div>
		</div>
	);
}

function renderRows(rows, rowProps, controlTypeData) {
	return rows.map(([key, Row]) => (
		<Row
			key={`settings-row-${rowProps.id}-${key}`}
			controlTypeData={controlTypeData}
			{...rowProps}
		/>
	));
}

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

	if (!id || !data) {
		return (
			<div className="lzb-block-builder-controls-item-settings">
				<p className="lzb-block-builder-controls-item-settings-empty">
					{__(
						'Select a control in the list to edit its settings.',
						'lazy-blocks'
					)}
				</p>
			</div>
		);
	}

	const rowProps = {
		updateData: (newData, optionalId = false) => {
			updateControlData(optionalId || id, newData);
		},
		data,
		id,
	};
	const controlTypeData = getControlTypeData(data.type);
	const rows = getSettingsRows(rowProps);

	return (
		<div className="lzb-block-builder-controls-item-settings">
			<ControlHeader rowProps={rowProps} TypeRow={rows.type} />
			{rows.settings.length ? (
				<PanelBody title={__('Settings', 'lazy-blocks')}>
					<div className="lzb-block-builder-control-group">
						{renderRows(rows.settings, rowProps, controlTypeData)}
					</div>
				</PanelBody>
			) : null}
			{rows.layout.length ? (
				<PanelBody title={__('Layout', 'lazy-blocks')}>
					<div className="lzb-block-builder-control-group">
						{renderRows(rows.layout, rowProps, controlTypeData)}
					</div>
				</PanelBody>
			) : null}
			{rows.behavior.length ? (
				<ToolsPanel
					label={__('Behavior', 'lazy-blocks')}
					resetAll={() => {
						const reset = {};
						rows.behavior.forEach(([key]) => {
							reset[key] = 'false';
						});
						rowProps.updateData(reset);
					}}
				>
					{rows.behavior.map(([key, Row]) => (
						<ToolsPanelItem
							key={`settings-row-${id}-${key}`}
							label={BEHAVIOR_LABELS[key]}
							hasValue={() => data[key] === 'true'}
							onDeselect={() =>
								rowProps.updateData({ [key]: 'false' })
							}
							isShownByDefault={key === 'required'}
						>
							<Row
								controlTypeData={controlTypeData}
								{...rowProps}
							/>
						</ToolsPanelItem>
					))}
				</ToolsPanel>
			) : null}
		</div>
	);
}
