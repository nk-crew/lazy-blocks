/**
 * WordPress dependencies.
 */
import { Button, SearchControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { CONTROL_CATEGORIES, getControlTypes } from './control-types';

const MOST_USED = [
	'text',
	'image',
	'rich_text',
	'select',
	'toggle',
	'repeater',
];

/**
 * The tile nearest to `current` in the next row up or down.
 *
 * @param {Array}       tiles     Enabled tiles.
 * @param {HTMLElement} current   Focused tile.
 * @param {number}      direction 1 for down, -1 for up.
 *
 * @return {HTMLElement|undefined} Tile to focus.
 */
function getTileInNextRow(tiles, current, direction) {
	const from = current.getBoundingClientRect();
	let rowTop = null;
	let result;
	let resultDistance = Infinity;

	tiles.forEach((tile) => {
		const rect = tile.getBoundingClientRect();
		const isNextRow =
			direction > 0 ? rect.top > from.top + 1 : rect.top < from.top - 1;

		if (!isNextRow) {
			return;
		}

		const isCloser =
			rowTop === null ||
			(direction > 0 ? rect.top < rowTop - 1 : rect.top > rowTop + 1);
		const isSameRow = rowTop !== null && Math.abs(rect.top - rowTop) <= 1;

		if (isCloser) {
			rowTop = rect.top;
			resultDistance = Infinity;
		} else if (!isSameRow) {
			return;
		}

		const distance = Math.abs(rect.left - from.left);
		if (distance < resultDistance) {
			resultDistance = distance;
			result = tile;
		}
	});

	return result;
}

/**
 * Searchable grid of control types, grouped like the block inserter.
 *
 * @param {Object}   props
 * @param {Object}   props.data    Data of the control the type is for (`child_of`, `placement`).
 * @param {string}   props.current Current type, when changing the type of a control.
 * @param {Function} props.onPick  Called with the picked type name.
 */
export default function ControlTypePicker({ data, current, onPick }) {
	const [search, setSearch] = useState('');
	const listRef = useRef();

	const blockData = useSelect(
		(select) => select('lazy-blocks/block-data').getBlockData(),
		[]
	);

	const query = search.trim().toLowerCase();
	const types = getControlTypes(data, blockData).filter(
		(type) =>
			!query ||
			type.label.toLowerCase().includes(query) ||
			type.name.toLowerCase().includes(query)
	);

	const groups = [];

	if (!query) {
		const mostUsed = MOST_USED.map((name) =>
			types.find((type) => type.name === name)
		).filter(Boolean);

		if (mostUsed.length) {
			groups.push({
				name: 'most-used',
				title: __('Most used', 'lazy-blocks'),
				types: mostUsed,
			});
		}
	}

	Object.keys(CONTROL_CATEGORIES).forEach((cat) => {
		const catTypes = types.filter((type) => type.category === cat);

		if (catTypes.length) {
			groups.push({
				name: cat,
				title: CONTROL_CATEGORIES[cat] || cat,
				types: catTypes,
			});
		}
	});

	function getTiles() {
		return [
			...listRef.current.querySelectorAll(
				'.lzb-control-type-picker__item:not([disabled])'
			),
		];
	}

	function onSearchKeyDown(event) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			getTiles()[0]?.focus();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const first = types.find((type) => !type.isDisabled);

			if (first) {
				onPick(first.name);
			}
		}
	}

	function onListKeyDown(event) {
		const tiles = getTiles();
		const index = tiles.indexOf(event.target);

		if (index === -1) {
			return;
		}

		let next;

		switch (event.key) {
			case 'ArrowRight':
				next = tiles[index + 1];
				break;
			case 'ArrowLeft':
				next = tiles[index - 1];
				break;
			case 'ArrowDown':
				next = getTileInNextRow(tiles, event.target, 1);
				break;
			case 'ArrowUp':
				next = getTileInNextRow(tiles, event.target, -1);
				if (!next) {
					next = listRef.current
						.closest('.lzb-control-type-picker')
						.querySelector('input');
				}
				break;
			default:
				return;
		}

		event.preventDefault();
		next?.focus();
	}

	return (
		<div className="lzb-control-type-picker">
			<SearchControl
				value={search}
				onChange={setSearch}
				onKeyDown={onSearchKeyDown}
				label={__('Search control types', 'lazy-blocks')}
				placeholder={__('Search', 'lazy-blocks')}
				__nextHasNoMarginBottom
			/>
			<div
				ref={listRef}
				className="lzb-control-type-picker__list"
				onKeyDown={onListKeyDown}
			>
				{groups.map((group) => (
					<div
						key={group.name}
						className="lzb-control-type-picker__group"
						role="group"
						aria-label={group.title}
					>
						<div
							className="lzb-control-type-picker__group-title"
							aria-hidden="true"
						>
							{group.title}
						</div>
						<div className="lzb-control-type-picker__grid">
							{group.types.map((type) => (
								<Button
									key={type.name}
									className="lzb-control-type-picker__item"
									onClick={() => onPick(type.name)}
									disabled={type.isDisabled}
									isPressed={current === type.name}
								>
									{/* eslint-disable-next-line react/no-danger */}
									<span
										className="lzb-control-type-picker__item-icon"
										dangerouslySetInnerHTML={{
											__html: type.icon,
										}}
									/>
									<span className="lzb-control-type-picker__item-label">
										{type.label}
									</span>
								</Button>
							))}
						</div>
					</div>
				))}
				{!groups.length && (
					<p className="lzb-control-type-picker__empty">
						{__('No control types found.', 'lazy-blocks')}
					</p>
				)}
			</div>
		</div>
	);
}
