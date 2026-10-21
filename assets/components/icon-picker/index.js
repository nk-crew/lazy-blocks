/**
 * Styles.
 */
import './editor.scss';

import {
	BaseControl,
	Button,
	Dropdown,
	G,
	Path,
	SVG,
	TextControl,
	Tooltip,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

// Icons are rendered in batches while the list scrolls, rendering all ~900 SVGs at once lags.
const ICONS_BATCH = 60;

// The icons list is localized only on the block builder screen.
function getIcons() {
	return (
		window.lazyblocksBlockBuilderData?.icons ||
		window.lazyblocksGutenberg?.icons ||
		{}
	);
}

function Icon({ svg, onClick, active }) {
	return (
		<IconPicker.Preview
			className={classnames(
				'lazyblocks-component-icon-picker-button',
				active ? 'lazyblocks-component-icon-picker-button-active' : ''
			)}
			onClick={onClick}
			svg={svg}
		/>
	);
}

const hiddenIconCategories = {};

function CategoryToggle({ categoryName, showCategory, onToggle }) {
	return (
		// Used PanelBody https://github.com/WordPress/gutenberg/blob/master/packages/components/src/panel/body.js.
		<div
			className={classnames(
				'components-panel__body lazyblocks-component-icon-picker-list-panel-toggle',
				showCategory ? 'is-opened' : ''
			)}
		>
			<h2 className="components-panel__body-title">
				<Button
					className="components-panel__body-toggle"
					onClick={onToggle}
					aria-expanded={showCategory}
				>
					{/*
						Firefox + NVDA don't announce aria-expanded because the browser
						repaints the whole element, so this wrapping span hides that.
					*/}
					<span aria-hidden="true">
						{showCategory ? (
							<SVG
								className="components-panel__arrow"
								width="24px"
								height="24px"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<G>
									<Path fill="none" d="M0,0h24v24H0V0z" />
								</G>
								<G>
									<Path d="M12,8l-6,6l1.41,1.41L12,10.83l4.59,4.58L18,14L12,8z" />
								</G>
							</SVG>
						) : (
							<SVG
								className="components-panel__arrow"
								width="24px"
								height="24px"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<G>
									<Path fill="none" d="M0,0h24v24H0V0z" />
								</G>
								<G>
									<Path d="M7.41,8.59L12,13.17l4.59-4.58L18,10l-6,6l-6-6L7.41,8.59z" />
								</G>
							</SVG>
						)}
					</span>
					{categoryName.charAt(0).toUpperCase() +
						categoryName.slice(1)}
				</Button>
			</h2>
		</div>
	);
}

function IconPickerList({
	value,
	onChange,
	search,
	setSearch,
	hiddenCategories,
	setHiddenCategories,
}) {
	const [limit, setLimit] = useState(ICONS_BATCH);
	const scrollRef = useRef();

	const icons = getIcons();
	const searchString = search.toLowerCase();
	const categories = [];
	let rendered = 0;
	let hasMore = false;

	Object.keys(icons).some((categoryName) => {
		const iconNames = Object.keys(icons[categoryName]).filter(
			(iconName) => !searchString || iconName.indexOf(searchString) > -1
		);

		if (!iconNames.length) {
			return false;
		}

		if (rendered >= limit) {
			hasMore = true;
			return true;
		}

		const showCategory =
			typeof hiddenCategories[categoryName] !== 'undefined'
				? hiddenCategories[categoryName]
				: true;
		let visibleNames = [];

		if (showCategory) {
			visibleNames = iconNames.slice(0, limit - rendered);
			rendered += visibleNames.length;
			hasMore = hasMore || visibleNames.length < iconNames.length;
		}

		categories.push({ categoryName, showCategory, visibleNames });

		return false;
	});

	function maybeLoadMore() {
		const el = scrollRef.current;

		if (
			hasMore &&
			el &&
			el.scrollTop + el.clientHeight >= el.scrollHeight - 200
		) {
			setLimit(limit + ICONS_BATCH);
		}
	}

	// Load the next batch when the rendered icons do not fill the popover.
	useEffect(() => {
		maybeLoadMore();
	});

	return (
		<>
			<div className="lazyblocks-component-icon-picker-sizer" />
			<div
				className="lazyblocks-component-icon-picker"
				ref={scrollRef}
				onScroll={maybeLoadMore}
			>
				<div className="lazyblocks-component-icon-picker-list-wrap">
					<TextControl
						label={__('Search Icon', 'lazy-blocks')}
						value={search}
						onChange={(searchVal) => {
							setSearch(searchVal);
							setLimit(ICONS_BATCH);
						}}
						placeholder={__('Type to Search…', 'lazy-blocks')}
						autoComplete="off"
					/>
					{categories.map(
						({ categoryName, showCategory, visibleNames }) => (
							<div key={categoryName}>
								<CategoryToggle
									categoryName={categoryName}
									showCategory={showCategory}
									onToggle={() => {
										setHiddenCategories({
											...hiddenCategories,
											[categoryName]: !showCategory,
										});
									}}
								/>
								{visibleNames.length ? (
									<div className="lazyblocks-component-icon-picker-list">
										{visibleNames.map((iconName) => {
											const icon =
												icons[categoryName][iconName];

											return (
												<Tooltip
													key={iconName}
													text={iconName}
												>
													{/* We need this <div> just because Tooltip don't work without it */}
													<div>
														<Icon
															active={
																icon === value
															}
															svg={icon}
															onClick={() => {
																onChange(icon);
															}}
														/>
													</div>
												</Tooltip>
											);
										})}
									</div>
								) : null}
							</div>
						)
					)}
					{!categories.length
						? __('No icons found.', 'lazy-blocks')
						: null}
				</div>
			</div>
		</>
	);
}

/**
 * Dropdown
 *
 * @param {Object} props - component props.
 *
 * @return {JSX} - component render.
 */
function IconPickerDropdown(props) {
	const { onChange, value, label, className, renderToggle } = props;

	const [search, setSearch] = useState('');
	const [hiddenCategories, setHiddenCategories] =
		useState(hiddenIconCategories);

	const dropdown = (
		<Dropdown
			className={className}
			contentClassName="lazyblocks-component-icon-picker-content"
			renderToggle={renderToggle}
			focusOnMount={false}
			renderContent={() => (
				<IconPickerList
					value={value}
					onChange={onChange}
					search={search}
					setSearch={setSearch}
					hiddenCategories={hiddenCategories}
					setHiddenCategories={setHiddenCategories}
				/>
			)}
		/>
	);

	return label ? (
		<BaseControl id={label} label={label} className={className}>
			{dropdown}
		</BaseControl>
	) : (
		dropdown
	);
}

export default function IconPicker({ value, onChange, label }) {
	return (
		<IconPicker.Dropdown
			label={label}
			className="lazyblocks-component-icon-picker-wrapper"
			onChange={onChange}
			value={value}
			renderToggle={({ isOpen, onToggle }) => (
				<Tooltip text={__('Icon Picker', 'lazy-blocks')}>
					{/* We need this <div> just because Tooltip don't work without it */}
					<div>
						<IconPicker.Preview
							className="lazyblocks-component-icon-picker-button hover"
							aria-expanded={isOpen}
							onClick={onToggle}
							svg={value}
							alwaysRender
						/>
					</div>
				</Tooltip>
			)}
		/>
	);
}

// dropdown
IconPicker.Dropdown = IconPickerDropdown;

// preview icon.
IconPicker.Preview = (props) => {
	const { onClick, className, svg, alwaysRender = false } = props;

	let result = '';

	if (/^dashicons/.test(svg)) {
		result = <span className={`dashicons ${svg}`} />;
	} else if (svg) {
		// eslint-disable-next-line react/no-danger
		result = <span dangerouslySetInnerHTML={{ __html: svg }} />;
	}

	return result || alwaysRender ? (
		<span
			className={classnames(
				className,
				'lazyblocks-component-icon-picker-preview',
				onClick
					? 'lazyblocks-component-icon-picker-preview-clickable'
					: ''
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (onClick && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					onClick(e);
				}
			}}
			role="button"
			tabIndex={0}
		>
			{result}
		</span>
	) : (
		''
	);
};
