/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';
import {
	DndContext,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { Button, ButtonGroup, Tooltip } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import CustomPointerSensor from '../../assets/utils/dnd-kit-custom-pointer-sensor';

const RepeaterItem = function (props) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		isSorting,
	} = useSortable({
		id: props.id,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition: isSorting ? transition : '',
	};

	return (
		<div
			className={classnames(
				'lzb-gutenberg-repeater-item',
				isDragging ? 'lzb-gutenberg-repeater-item-dragging' : ''
			)}
			ref={setNodeRef}
			style={style}
		>
			<div
				className={`lzb-gutenberg-repeater-btn${
					props.active ? ' lzb-gutenberg-repeater-btn-active' : ''
				}`}
				onClick={props.onToggle}
				onKeyDown={() => {}}
				role="button"
				tabIndex={0}
			>
				<Button
					className="lzb-gutenberg-repeater-btn-drag"
					role="button"
					{...attributes}
					{...listeners}
				>
					<svg
						width="18"
						height="18"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 18 18"
						role="img"
						aria-hidden="true"
						focusable="false"
					>
						<path d="M5 4h2V2H5v2zm6-2v2h2V2h-2zm-6 8h2V8H5v2zm6 0h2V8h-2v2zm-6 6h2v-2H5v2zm6 0h2v-2h-2v2z" />
					</svg>
				</Button>
				<div
					className="lzb-gutenberg-repeater-btn-title"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{ __html: props.title }}
				/>
				{!props.controlData.rows_max ||
				props.count < props.controlData.rows_max ? (
					// eslint-disable-next-line react/button-has-type
					<button
						className="lzb-gutenberg-repeater-btn-duplicate"
						onClick={props.onDuplicate}
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
							/>
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</svg>
					</button>
				) : null}
				{!props.controlData.rows_min ||
				props.count > props.controlData.rows_min ? (
					// eslint-disable-next-line react/button-has-type
					<button
						className="lzb-gutenberg-repeater-btn-remove"
						onClick={props.onRemove}
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
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							<line x1="10" x2="10" y1="11" y2="17" />
							<line x1="14" x2="14" y1="11" y2="17" />
						</svg>
					</button>
				) : null}
				<div className="lzb-gutenberg-repeater-btn-arrow">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-hidden="true"
						focusable="false"
					>
						<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
					</svg>
				</div>
			</div>
			{props.active ? props.renderContent() : ''}
		</div>
	);
};

function RepeaterControl(props) {
	const {
		count = 0,
		controlData,
		renderRow = () => {},
		addRow = () => {},
		duplicateRow = () => {},
		removeRow = () => {},
		resortRow = () => {},
		getInnerControls = () => {},
	} = props;

	const sensors = useSensors(useSensor(CustomPointerSensor));

	let activeItemDefault = -1;

	if (controlData.rows_collapsible === 'false') {
		activeItemDefault = -2;
	} else if (controlData.rows_collapsed === 'false') {
		activeItemDefault = -2;
	}

	const [activeItem, setActiveItem] = useState(activeItemDefault);

	function getRowTitle(i) {
		const valObjectVariants = [
			'alt',
			'url',
			'title',
			'caption',
			'description',
			'id',
			'link',
		];
		let title = controlData.rows_label || __('Row {{#}}', 'lazy-blocks');

		// add row number.
		title = title.replace(/{{#}}/g, i + 1);

		const innerControls = getInnerControls(i);

		// add inner controls values.
		if (innerControls) {
			Object.keys(innerControls).forEach((k) => {
				const { data } = innerControls[k];

				let val = innerControls[k].val || '';

				// Prepare object value variants.
				if (typeof val === 'object') {
					valObjectVariants.forEach((tag) => {
						title = title.replace(
							new RegExp(`{{${data.name}.${tag}}}`, 'g'),
							val[tag] || ''
						);
					});
				}

				// Add support for image control tag displaying.
				if (data.type === 'image' && val.url) {
					val = `<img src="${val.url}" loading="lazy" />`;
				}

				// In case if value is object - display nothing.
				if (typeof val === 'object') {
					val = '';
				}

				title = title.replace(new RegExp(`{{${data.name}}}`, 'g'), val);
			});
		}

		return title;
	}

	// Mount.
	useEffect(() => {
		// add rows to meet Minimum requirements
		if (
			controlData.rows_min &&
			controlData.rows_min > 0 &&
			controlData.rows_min > count
		) {
			const needToAdd = controlData.rows_min - count;

			for (let i = 0; i < needToAdd; i += 1) {
				addRow();
			}
		}
	});

	const items = [];
	for (let i = 0; i < count; i += 1) {
		const active = activeItem === -2 || activeItem === i;

		items.push({
			id: i + 1,
			title: getRowTitle(i),
			active,
			count,
			controlData,
			onToggle: (e) => {
				e.preventDefault();
				e.stopPropagation();

				if (controlData.rows_collapsible === 'true') {
					setActiveItem(active ? -1 : i);
				}
			},
			onRemove: (e) => {
				e.preventDefault();
				e.stopPropagation();

				removeRow(i);
			},
			onDuplicate: (e) => {
				e.preventDefault();
				e.stopPropagation();

				duplicateRow(i);

				// Open newly added row.
				if (activeItem === i) {
					setActiveItem(i + 1);
				}
			},
			renderContent: () => (
				<div className="lzb-gutenberg-repeater-item-content">
					{renderRow(i)}
				</div>
			),
		});
	}

	return (
		<div className="lzb-gutenberg-repeater">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={(event) => {
					const { active, over } = event;

					if (active.id !== over.id) {
						resortRow(active.id - 1, over.id - 1);

						if (activeItem > -1) {
							setActiveItem(over.id - 1);
						}
					}
				}}
			>
				{items.length ? (
					<div className="lzb-gutenberg-repeater-items">
						<SortableContext
							items={items}
							strategy={verticalListSortingStrategy}
						>
							{items.map((value) => (
								<RepeaterItem
									key={`lzb-block-builder-controls-items-sortable-${value.id}`}
									{...value}
								/>
							))}
						</SortableContext>
					</div>
				) : null}
			</DndContext>
			<ButtonGroup className="lzb-gutenberg-repeater-options">
				<Button
					variant="secondary"
					size="compact"
					className="lzb-gutenberg-repeater-options-add"
					disabled={
						controlData.rows_max && count >= controlData.rows_max
					}
					onClick={() => {
						addRow();

						// Open newly added row.
						if (activeItem !== -2) {
							setActiveItem(items.length);
						}
					}}
				>
					{controlData.rows_add_button_label ||
						__('+ Add Row', 'lazy-blocks')}
				</Button>
				{controlData.rows_collapsible === 'true' &&
				items.length &&
				items.length > 1 ? (
					<Tooltip text={__('Toggle all rows', 'lazy-blocks')}>
						<Button
							variant={activeItem === -2 ? 'primary' : ''}
							size="compact"
							className="lzb-gutenberg-repeater-options-expand"
							onClick={() => {
								setActiveItem(activeItem === -2 ? -1 : -2);
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
								<path d="m7 15 5 5 5-5" />
								<path d="m7 9 5-5 5 5" />
							</svg>
						</Button>
					</Tooltip>
				) : (
					''
				)}
			</ButtonGroup>
		</div>
	);
}

export default withInstanceId(RepeaterControl);
