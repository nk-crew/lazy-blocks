/**
 * Styles.
 */
import './editor.scss';

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem,
	Button,
	PanelBody,
	Path,
	ToolsPanel as StableToolsPanel,
	ToolsPanelItem as StableToolsPanelItem,
	SVG,
} from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
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

const copyIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5 4.5h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5ZM3 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm17 3v10.75c0 .69-.56 1.25-1.25 1.25H6v1.5h12.75a2.75 2.75 0 0 0 2.75-2.75V8H20Z"
		/>
	</SVG>
);

const checkIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M16.7 7.1l-6.3 8.5-3.3-2.5-.9 1.2 4.5 3.4L17.9 8z" />
	</SVG>
);

const BEHAVIOR_LABELS = {
	required: __('Required', 'lazy-blocks'),
	hide_if_not_selected: __('Hide until the block is selected', 'lazy-blocks'),
	translate: __('Translate with WPML', 'lazy-blocks'),
	save_in_meta: __('Save in post meta', 'lazy-blocks'),
};

function CopyNameButton({ name }) {
	const [copied, setCopied] = useState(false);
	const timeout = useRef();

	const ref = useCopyToClipboard(name, () => {
		setCopied(true);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => setCopied(false), 2000);
	});

	useEffect(() => () => clearTimeout(timeout.current), []);

	return (
		<Button
			ref={ref}
			size="small"
			icon={copied ? checkIcon : copyIcon}
			label={
				copied
					? __('Copied', 'lazy-blocks')
					: __('Copy name', 'lazy-blocks')
			}
		/>
	);
}

/**
 * Icon, label, type and template name of the selected control.
 *
 * @param {Object}   props
 * @param {Object}   props.rowProps Props passed to every settings row.
 * @param {Function} props.TypeRow  Type switch, when the type can be changed.
 */
function ControlHeader({ rowProps, TypeRow }) {
	const { data } = rowProps;
	const controlTypeData = getControlTypeData(data.type);

	const outputMethod = useSelect(
		(select) =>
			select('lazy-blocks/block-data').getBlockData()
				?.code_output_method || 'html',
		[]
	);

	let name = controlTypeData.restrictions.name_settings ? data.name : '';
	if (name && data.save_in_meta === 'true' && data.save_in_meta_name) {
		name = data.save_in_meta_name;
	}

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
				{name ? (
					<div className="lzb-block-builder-control-card-name">
						<code>
							{outputMethod === 'html' ? `{{${name}}}` : name}
						</code>
						<CopyNameButton name={name} />
					</div>
				) : null}
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
