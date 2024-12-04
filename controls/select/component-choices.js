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
import { arrayMoveImmutable } from 'array-move';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { BaseControl, TextControl, Button } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';

/**
 * Internal dependencies.
 */
import CustomPointerSensor from '../../assets/utils/dnd-kit-custom-pointer-sensor';

const SortableItem = function (props) {
	const { id, values, focusInput } = props;

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

	return (
		<div
			className={classnames(
				'lzb-block-builder-controls-item-settings-choices-item',
				isDragging
					? 'lzb-block-builder-controls-item-settings-choices-item-dragging'
					: ''
			)}
			ref={setNodeRef}
			style={style}
		>
			{values.map((opt, i) => {
				return (
					<TextControl
						key={opt.name}
						placeholder={opt.label}
						value={opt.value}
						onChange={(value) =>
							props.updateChoice({ [opt.name]: value })
						}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={focusInput && i === 0}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				);
			})}
			<div
				className="lzb-block-builder-controls-item-settings-choices-item-handler"
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
			</div>
			{/* eslint-disable-next-line react/button-has-type */}
			<button
				className="lzb-block-builder-controls-item-settings-choices-item-remove"
				onClick={() => props.removeChoice()}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6.33734 7.1706C6.23299 6.4793 6.76826 5.85717 7.4674 5.85717H16.5326C17.2317 5.85717 17.767 6.4793 17.6627 7.17061L15.9807 18.3134C15.8963 18.8724 15.416 19.2857 14.8507 19.2857H9.14934C8.58403 19.2857 8.10365 18.8724 8.01928 18.3134L6.33734 7.1706Z"
						stroke="currentColor"
						strokeWidth="1.71429"
					/>
					<rect
						x="4"
						y="5"
						width="16"
						height="2"
						fill="currentColor"
					/>
					<path
						d="M14.2857 5C14.2857 5 13.2624 5 12 5C10.7376 5 9.71428 5 9.71428 5C9.71428 3.73763 10.7376 2.71429 12 2.71429C13.2624 2.71429 14.2857 3.73763 14.2857 5Z"
						fill="currentColor"
					/>
				</svg>
			</button>
		</div>
	);
};

export default function ComponentChoices(props) {
	const {
		value = [],
		onChange,
		options = [
			{
				name: 'label',
				label: __('Label', 'lazy-blocks'),
			},
			{
				name: 'value',
				label: __('Value', 'lazy-blocks'),
			},
		],
		label = __('Choices', 'lazy-blocks'),
		labelAddChoice = __('+ Add Choice', 'lazy-blocks'),
		id = 'lzb-component-choices',
		help,
	} = props;

	const prevValueLength = usePrevious(value && value.length);

	const sensors = useSensors(useSensor(CustomPointerSensor));

	function addChoice() {
		const defaults = {};

		options.forEach((val) => {
			defaults[val.name] = val.defaults ?? '';
		});

		onChange([...value, defaults]);
	}

	function removeChoice(i) {
		value.splice(i, 1);

		onChange(value);
	}

	function updateChoice(i, newData) {
		if (value[i]) {
			value[i] = {
				...value[i],
				...newData,
			};

			onChange(value);
		}
	}

	function resortChoice(oldIndex, newIndex) {
		const newChoices = arrayMoveImmutable(value, oldIndex, newIndex);

		onChange(newChoices);
	}

	const items = [];
	let focusNewChoice = false;

	if (value && value.length) {
		value.forEach((choice, i) => {
			const values = [];

			options.forEach((opt) => {
				values.push({
					name: opt.name,
					label: opt.label,
					value: choice[opt.name] ?? '',
				});
			});

			items.push({
				id: i + 1,
				values,
				removeChoice() {
					removeChoice(i);
				},
				updateChoice(newData) {
					updateChoice(i, newData);
				},
			});
		});

		// Focus newly added choice input.
		if (prevValueLength < value.length) {
			focusNewChoice = true;
		}
	}

	return (
		<BaseControl id={id} label={label} help={help} __nextHasNoMarginBottom>
			<div className="lzb-block-builder-controls-item-settings-choices">
				{items.length ? (
					<div className="lzb-block-builder-controls-item-settings-choices-items">
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={(event) => {
								const { active, over } = event;

								if (active.id !== over.id) {
									resortChoice(active.id - 1, over.id - 1);
								}
							}}
						>
							<SortableContext
								items={items}
								strategy={verticalListSortingStrategy}
							>
								{items.map((item, i) => {
									return (
										<SortableItem
											key={`lzb-block-builder-controls-item-settings-choices-item-${item.id}`}
											{...item}
											focusInput={
												i + 1 === value.length
													? focusNewChoice
													: false
											}
										/>
									);
								})}
							</SortableContext>
						</DndContext>
					</div>
				) : null}
				<div>
					<Button
						onClick={() => addChoice()}
						variant="secondary"
						size="small"
					>
						{labelAddChoice}
					</Button>
				</div>
			</div>
		</BaseControl>
	);
}
