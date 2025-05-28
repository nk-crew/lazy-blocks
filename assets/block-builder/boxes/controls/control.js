/* eslint-disable camelcase */
/**
 * WordPress dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from 'lodash';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';

const { navigator } = window;
let copiedTimeout;

export default function Control(props) {
	const { data, id, addControl, removeControl, controls } = props;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isSorting,
	} = useSortable({
		id,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition: isSorting ? transition : '',
	};

	const [copied, setCopied] = useState(false);

	const { isSelected } = useSelect(
		(select) => {
			const { getSelectedControlId } = select('lazy-blocks/block-data');

			return {
				isSelected: id === getSelectedControlId(),
			};
		},
		[id]
	);

	const { selectControl } = useDispatch('lazy-blocks/block-data');

	function copyName(name) {
		navigator.clipboard.writeText(name).then(() => {
			setCopied(true);

			clearTimeout(copiedTimeout);

			copiedTimeout = setTimeout(() => {
				setCopied(false);
			}, 2500);
		});
	}

	const {
		label,
		name,
		placeholder,
		alongside_text,
		save_in_meta,
		save_in_meta_name,
		type,
		required,
	} = data;

	const controlTypeData = getControlTypeData(type);

	let controlName = name;
	if (save_in_meta === 'true') {
		controlName = save_in_meta_name || name;
	}

	if (!controlTypeData.restrictions.name_settings) {
		controlName = '';
	}

	let isUseOnce = false;

	// restrict once per block.
	if (
		!isUseOnce &&
		controlTypeData &&
		controlTypeData.restrictions.once &&
		controls
	) {
		Object.keys(controls).forEach((i) => {
			if (controlTypeData.name === controls[i].type) {
				isUseOnce = true;
			}
		});
	}

	let controlsItemAttributes = {
		className: classnames(
			'lzb-block-builder-controls-item',
			controlTypeData.name === 'undefined'
				? 'lzb-block-builder-controls-item-undefined'
				: '',
			isSelected ? 'lzb-block-builder-controls-item-selected' : '',
			isDragging ? 'lzb-block-builder-controls-item-dragging' : ''
		),
		onClick: () => {
			selectControl(id);
		},
		role: 'none',
		'data-control-type': data.type,
		'data-control-name': data.name,
		'data-control-label': data.type,
		ref: setNodeRef,
		style,
	};
	controlsItemAttributes = applyFilters(
		`lzb.constructor.controls.${type}.item-attributes`,
		controlsItemAttributes,
		props
	);
	controlsItemAttributes = applyFilters(
		'lzb.constructor.controls.item-attributes',
		controlsItemAttributes,
		props
	);

	// Item with filter
	let controlsItem = (
		<div {...controlsItemAttributes}>
			<div className="lzb-block-builder-controls-item-icon">
				{/* eslint-disable-next-line react/no-danger */}
				<span
					dangerouslySetInnerHTML={{ __html: controlTypeData.icon }}
				/>
				<span
					className="lzb-block-builder-controls-item-handler"
					{...attributes}
					{...listeners}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M10 4.99976H8V6.99976H10V4.99976Z"
							fill="currentColor"
						/>
						<path
							d="M10 10.9998H8V12.9998H10V10.9998Z"
							fill="currentColor"
						/>
						<path
							d="M10 16.9998H8V18.9998H10V16.9998Z"
							fill="currentColor"
						/>
						<path
							d="M16 4.99976H14V6.99976H16V4.99976Z"
							fill="currentColor"
						/>
						<path
							d="M16 10.9998H14V12.9998H16V10.9998Z"
							fill="currentColor"
						/>
						<path
							d="M16 16.9998H14V18.9998H16V16.9998Z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</div>
			<div className="lzb-block-builder-controls-item-label">
				{controlTypeData.restrictions.label_settings ? (
					<>
						{label || placeholder || alongside_text || (
							<span className="lzb-block-builder-controls-item-label-no">
								{__('(no label)', 'lazy-blocks')}
							</span>
						)}
						{required === 'true' ? (
							<span className="required">*</span>
						) : (
							''
						)}
					</>
				) : (
					<>&nbsp;</>
				)}
			</div>
			<div className="lzb-block-builder-controls-item-buttons">
				{!isUseOnce && (
					<Button
						label={__('Duplicate', 'lazy-blocks')}
						showTooltip
						onClick={() => {
							const newData = merge({}, data);

							newData.label += ` ${__('(copy)', 'lazy-blocks')}`;
							newData.name += '-copy';

							addControl(newData, id);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect
								width="14"
								height="14"
								x="8"
								y="8"
								rx="2"
								ry="2"
								fill="none"
							/>
							<path
								d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
								fill="none"
							/>
						</svg>
					</Button>
				)}
				<Button
					label={__('Remove', 'lazy-blocks')}
					showTooltip
					onClick={() => {
						if (
							// eslint-disable-next-line no-alert
							window.confirm(
								__(
									'Do you really want to remove control?',
									'lazy-blocks'
								)
							)
						) {
							removeControl();
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 6h18" fill="none" />
						<path
							d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
							fill="none"
						/>
						<path
							d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
							fill="none"
						/>
					</svg>
				</Button>
				{!data.child_of && controlName && (
					<Button
						label={
							copied
								? __('Copied!', 'lazy-blocks')
								: __('Copy Name', 'lazy-blocks')
						}
						showTooltip
						onClick={() => {
							copyName(controlName);
						}}
					>
						{copied ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect
									width="8"
									height="4"
									x="8"
									y="2"
									rx="1"
									ry="1"
									fill="none"
								/>
								<path
									d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
									fill="none"
								/>
								<path d="m9 14 2 2 4-4" fill="none" />
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect
									width="8"
									height="4"
									x="8"
									y="2"
									rx="1"
									ry="1"
									fill="none"
								/>
								<path
									d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
									fill="none"
								/>
							</svg>
						)}
					</Button>
				)}
			</div>
		</div>
	);

	controlsItem = applyFilters(
		`lzb.constructor.controls.${type}.item`,
		controlsItem,
		props
	);
	controlsItem = applyFilters(
		'lzb.constructor.controls.item',
		controlsItem,
		props
	);

	return controlsItem;
}
