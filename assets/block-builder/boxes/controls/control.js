/* eslint-disable camelcase */
/**
 * WordPress dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Path,
	SVG,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';
import { merge } from 'lodash';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';
import { getLabelUpdate } from './control-types';

const { navigator } = window;

const moreIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z" />
	</SVG>
);

/**
 * Moves the focus to the label of the previous or next control in the list
 * and selects that control.
 *
 * @param {HTMLElement} label     Focused control label.
 * @param {number}      direction 1 for the next control, -1 for the previous.
 */
function focusSiblingControl(label, direction) {
	const labels = [
		...label
			.closest('.lzb-block-builder-controls')
			.querySelectorAll('.lzb-block-builder-controls-item-label'),
	];
	const next = labels[labels.indexOf(label) + direction];

	if (next) {
		next.click();
		// The Control tab focuses the label field of the selected control on
		// mount, keep the focus in the list instead.
		setTimeout(() => next.focus());
	}
}

export default function Control(props) {
	const { data, id, addControl, removeControl, updateData, controls } = props;

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

	const [isRenaming, setIsRenaming] = useState(false);

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
			{isRenaming ? (
				<input
					type="text"
					className="lzb-block-builder-controls-item-rename"
					aria-label={__('Control label', 'lazy-blocks')}
					defaultValue={label}
					// biome-ignore lint/a11y/noAutofocus: the field appears after a double click on the label.
					autoFocus
					onFocus={(e) => e.target.select()}
					onBlur={(e) => {
						if (!e.target.dataset.cancel) {
							updateData(
								getLabelUpdate(id, data, e.target.value)
							);
						}
						setIsRenaming(false);
					}}
					onKeyDown={(e) => {
						e.stopPropagation();

						if (e.key === 'Escape') {
							e.target.dataset.cancel = 'true';
						}
						if (e.key === 'Enter' || e.key === 'Escape') {
							e.preventDefault();
							e.target.blur();
						}
					}}
				/>
			) : (
				<div
					className="lzb-block-builder-controls-item-label"
					role="button"
					tabIndex={0}
					aria-pressed={isSelected}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							selectControl(id);
						} else if (
							e.key === 'ArrowDown' ||
							e.key === 'ArrowUp'
						) {
							e.preventDefault();
							focusSiblingControl(
								e.currentTarget,
								e.key === 'ArrowDown' ? 1 : -1
							);
						}
					}}
					onDoubleClick={() => {
						if (controlTypeData.restrictions.label_settings) {
							setIsRenaming(true);
						}
					}}
				>
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
					{controlName ? (
						<span className="lzb-block-builder-controls-item-name">
							{controlName}
						</span>
					) : null}
				</div>
			)}
			<div className="lzb-block-builder-controls-item-buttons">
				<DropdownMenu
					icon={moreIcon}
					label={__('Control actions', 'lazy-blocks')}
					toggleProps={{ size: 'small' }}
					popoverProps={{ placement: 'bottom-end' }}
				>
					{({ onClose }) => (
						<>
							<MenuGroup>
								{!isUseOnce && (
									<MenuItem
										onClick={() => {
											const newData = merge({}, data);

											newData.label += ` ${__('(copy)', 'lazy-blocks')}`;
											newData.name += '-copy';

											addControl(newData, id);
											onClose();
										}}
									>
										{__('Duplicate', 'lazy-blocks')}
									</MenuItem>
								)}
								{!data.child_of && controlName && (
									<MenuItem
										onClick={() => {
											navigator.clipboard.writeText(
												controlName
											);
											onClose();
										}}
									>
										{__('Copy name', 'lazy-blocks')}
									</MenuItem>
								)}
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									isDestructive
									onClick={() => {
										onClose();

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
									{__('Remove', 'lazy-blocks')}
								</MenuItem>
							</MenuGroup>
						</>
					)}
				</DropdownMenu>
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
