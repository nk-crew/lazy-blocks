/* eslint-disable no-param-reassign */
/**
 * External dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { arrayMoveImmutable } from 'array-move';
import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies.
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useState } from '@wordpress/element';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import RepeaterControl from './repeater-control';

function RepeaterControlWrapper(props) {
	const val = props.getValue() || [];

	// It is used to save changes in undo/redo history.
	// TODO: probably we should use this in all controls.
	const { __unstableMarkLastChangeAsPersistent = false } =
		useDispatch('core/block-editor') || {};

	return (
		<BaseControl {...useBlockControlProps(props)}>
			<RepeaterControl
				controlData={props.data}
				count={val.length}
				getInnerControls={(index) => {
					const innerControls = props.getControls(props.uniqueId);
					const innerResult = {};

					Object.keys(innerControls).forEach((i) => {
						const innerData = innerControls[i];

						innerResult[i] = {
							data: innerData,
							val: props.getValue(innerData, index),
						};
					});

					return innerResult;
				}}
				renderRow={(index) => (
					<>
						{props.renderControls(
							props.placement,
							props.group,
							props.uniqueId,
							index
						)}
					</>
				)}
				removeRow={(i) => {
					if (i > -1) {
						val.splice(i, 1);
						props.onChange(val);

						if (__unstableMarkLastChangeAsPersistent) {
							__unstableMarkLastChangeAsPersistent();
						}
					}
				}}
				addRow={() => {
					const innerControls = props.getControls(props.uniqueId);
					const newRow = {};

					// Add defaults to the new row.
					Object.keys(innerControls).forEach((i) => {
						const innerControl = innerControls[i];

						// Add default values of controls.
						newRow[innerControl.name] =
							innerControl.default || innerControl.checked || '';
					});

					val.push(newRow);
					props.onChange(val);

					if (__unstableMarkLastChangeAsPersistent) {
						__unstableMarkLastChangeAsPersistent();
					}
				}}
				duplicateRow={(i) => {
					val.push(cloneDeep(val[i]));

					const newVal = arrayMoveImmutable(
						val,
						val.length - 1,
						i + 1
					);
					props.onChange(newVal);

					if (__unstableMarkLastChangeAsPersistent) {
						__unstableMarkLastChangeAsPersistent();
					}
				}}
				resortRow={(oldIndex, newIndex) => {
					const newVal = arrayMoveImmutable(val, oldIndex, newIndex);
					props.onChange(newVal);

					if (__unstableMarkLastChangeAsPersistent) {
						__unstableMarkLastChangeAsPersistent();
					}
				}}
			/>
		</BaseControl>
	);
}

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.repeater.render',
	'lzb.editor',
	(render, props) => {
		return <RepeaterControlWrapper {...props} />;
	}
);

/**
 * getValue filter in editor.
 */
addFilter('lzb.editor.control.repeater.getValue', 'lzb.editor', (value) => {
	// change string value to array.
	if (typeof value === 'string') {
		try {
			// WPML decodes string in a different way, so we have to use decodeURIComponent
			// when string does not contains ':'.
			if (value.includes(':')) {
				value = JSON.parse(decodeURI(value));
			} else {
				value = JSON.parse(decodeURIComponent(value));
			}
		} catch (e) {
			value = [];
		}
	}

	return value;
});

/**
 * updateValue filter in editor.
 */
addFilter('lzb.editor.control.repeater.updateValue', 'lzb.editor', (value) => {
	// change array value to string.
	if (typeof value === 'object' || Array.isArray(value)) {
		value = encodeURI(JSON.stringify(value));
	}

	return value;
});

/**
 * Repeater item with childs render
 *
 * @param {Object} props - component props.
 *
 * @return {JSX} - component return.
 */
function ControlsRepeaterItem(props) {
	const { printControls, id, controls } = props;
	const [collapsedChilds, setCollapsedChilds] = useState(false);

	function toggleCollapseChilds() {
		setCollapsedChilds(!collapsedChilds);
	}

	// repeater child items count.
	let childItemsNum = 0;
	Object.keys(controls).forEach((thisId) => {
		const controlData = controls[thisId];

		if (controlData.child_of === id) {
			childItemsNum += 1;
		}
	});

	let toggleText = __('Show Child Controls', 'lazy-blocks');
	if (collapsedChilds) {
		toggleText = __('Hide Child Controls', 'lazy-blocks');
	} else if (childItemsNum) {
		toggleText = sprintf(
			// translators: %d: number of child controls.
			_n(
				'Show %d Child Control',
				'Show %d Child Controls',
				childItemsNum,
				'lazy-blocks'
			),
			childItemsNum
		);
	}

	return (
		<>
			{/* eslint-disable-next-line react/button-has-type */}
			<button
				className={classnames(
					'lzb-block-builder-controls-item-repeater-toggle',
					collapsedChilds
						? 'lzb-block-builder-controls-item-repeater-toggle-collapsed'
						: ''
				)}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					toggleCollapseChilds();
				}}
			>
				{toggleText}
				<svg
					aria-hidden="true"
					focusable="false"
					role="img"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 320 512"
				>
					<path
						fill="currentColor"
						d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
					/>
				</svg>
			</button>
			{collapsedChilds ? (
				<div className="lzb-block-builder-controls-item-childs">
					{printControls(id)}
				</div>
			) : (
				''
			)}
		</>
	);
}

/**
 * Control lists item render in block builder.
 */
addFilter(
	'lzb.constructor.controls.repeater.item',
	'lzb.constructor',
	(render, props) => (
		<>
			{render}
			<ControlsRepeaterItem {...props} />
		</>
	)
);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.repeater.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Row Label', 'lazy-blocks')}
						placeholder={__('Row {{#}}', 'lazy-blocks')}
						help={__(
							'Example: "My row number {{#}} with inner control {{control_name}}"',
							'lazy-blocks'
						)}
						value={data.rows_label}
						onChange={(value) => updateData({ rows_label: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Add Button Label', 'lazy-blocks')}
						placeholder={__('+ Add Row', 'lazy-blocks')}
						value={data.rows_add_button_label}
						onChange={(value) =>
							updateData({ rows_add_button_label: value })
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						type="number"
						label={__('Minimum Rows', 'lazy-blocks')}
						placeholder={0}
						min={0}
						value={data.rows_min}
						onChange={(value) => updateData({ rows_min: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						type="number"
						label={__('Maximum Rows', 'lazy-blocks')}
						placeholder={0}
						min={0}
						value={data.rows_max}
						onChange={(value) => updateData({ rows_max: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lazyblocks-control-repeater-collapsible"
						label={__('Collapsible Rows', 'lazy-blocks')}
					>
						<ToggleControl
							id="lazyblocks-control-repeater-collapsible"
							label={__('Yes', 'lazy-blocks')}
							checked={data.rows_collapsible === 'true'}
							onChange={(value) =>
								updateData({
									rows_collapsible: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
						{data.rows_collapsible === 'true' ? (
							<ToggleControl
								label={__(
									'Collapsed by Default',
									'lazy-blocks'
								)}
								checked={data.rows_collapsed === 'true'}
								onChange={(value) =>
									updateData({
										rows_collapsed: value
											? 'true'
											: 'false',
									})
								}
								__nextHasNoMarginBottom
							/>
						) : (
							''
						)}
					</BaseControl>
				</PanelBody>
			</>
		);
	}
);
