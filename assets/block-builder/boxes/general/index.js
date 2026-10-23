/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */

import {
	BaseControl,
	Button,
	Notice,
	PanelBody,
	Path,
	SVG,
	TextareaControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import BlockSlugControl from '../../../components/block-slug';
import IconPicker from '../../../components/icon-picker';
import Select from '../../../components/select';
import { getSlugWithNamespace, isValidSlug } from '../../../utils/block-slug';

export const SlugSettingsControl = ({ value, onChange }) => {
	const [isSlugValid, setIsSlugValid] = useState(true);

	useEffect(() => {
		if (!value) {
			return;
		}

		const isValid = isValidSlug(value);

		if (isValid !== isSlugValid) {
			setIsSlugValid(isValid);
		}
	}, [isSlugValid, value]);

	return (
		<>
			<BlockSlugControl
				label={__('Slug', 'lazy-blocks')}
				value={value}
				onChange={onChange}
			/>
			{!isSlugValid && (
				<Notice
					status="error"
					isDismissible={false}
					className="lzb-block-builder-notice"
				>
					{__(
						'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block',
						'lazy-blocks'
					)}
				</Notice>
			)}
		</>
	);
};

export const CategorySettingsControl = ({ value, onChange }) => {
	const { categories } = useSelect(
		(select) => ({
			categories: select('core/blocks').getCategories(),
		}),
		[]
	);

	let thereIsSelectedCat = false;
	const categoriesOpts = categories.map((cat) => {
		if (cat.slug === value) {
			thereIsSelectedCat = true;
		}
		return {
			value: cat.slug,
			label: cat.title,
		};
	});
	if (!thereIsSelectedCat) {
		categoriesOpts.push({
			value,
			label: value,
		});
	}

	return (
		<BaseControl
			id="lazyblocks-boxes-general-category"
			label={__('Category', 'lazy-blocks')}
		>
			<Select
				id="lazyblocks-boxes-general-category"
				isCreatable
				placeholder={__('Select category', 'lazy-blocks')}
				value={categoriesOpts.filter(
					(option) => option.value === value
				)}
				options={categoriesOpts}
				onChange={(val) => onChange(val.value)}
			/>
		</BaseControl>
	);
};

export const KeywordsSettingsControl = ({ value, onChange }) => {
	return (
		<BaseControl
			id="lazyblocks-boxes-general-keywords"
			label={__('Keywords', 'lazy-blocks')}
			help={__(
				'Make it easier to discover a block with keyword aliases',
				'lazy-blocks'
			)}
		>
			<Select
				id="lazyblocks-boxes-general-keywords"
				isCreatable
				isTags
				placeholder={__('Type keyword and push Enter', 'lazy-blocks')}
				value={(() => {
					if (value) {
						const result = value.split(',').map((val) => ({
							value: val,
							label: val,
						}));
						return result;
					}
					return [];
				})()}
				onChange={(val) => {
					let result = '';

					if (val) {
						val.forEach((optionData) => {
							if (optionData) {
								if (result) {
									result += ',';
								}

								result += optionData.value;
							}
						});
					}

					onChange(result);
				}}
			/>
		</BaseControl>
	);
};

const defaultBlockIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M19 8h-1V6h-5v2h-2V6H6v2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm.5 10c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-8c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v8z" />
	</SVG>
);

const editIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z" />
	</SVG>
);

const checkIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M16.7 7.1l-6.3 8.5-3.3-2.5-.9 1.2 4.5 3.4L17.9 8z" />
	</SVG>
);

export const IconSettingsControl = ({ value, onChange }) => {
	let preview = defaultBlockIcon;

	if (/^dashicons/.test(value)) {
		preview = <span className={`dashicons ${value}`} />;
	} else if (value) {
		// eslint-disable-next-line react/no-danger
		preview = <span dangerouslySetInnerHTML={{ __html: value }} />;
	}

	return (
		<IconPicker.Dropdown
			className="lazyblocks-component-icon-picker-wrapper"
			value={value}
			onChange={onChange}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					className="lzb-block-builder-block-card-icon"
					label={__('Change icon', 'lazy-blocks')}
					showTooltip
					aria-expanded={isOpen}
					onClick={onToggle}
				>
					{preview}
				</Button>
			)}
		/>
	);
};

/**
 * Block card: icon, title, description and slug, like the block card of the
 * block inspector.
 *
 * @param {Object} props
 * @param {Object} props.data     Block data.
 * @param {Object} props.icon     Icon control.
 * @param {Object} props.slug     Slug control, shown while the slug is edited.
 */
function BlockCard({ data, icon, slug }) {
	const [isEditingSlug, setIsEditingSlug] = useState(false);
	const slugRef = useRef();

	const title = useSelect(
		(select) => select('core/editor').getEditedPostAttribute('title'),
		[]
	);

	const isSlugValid = !!data.slug && isValidSlug(data.slug);
	const showSlugControl = slug && (isEditingSlug || !isSlugValid);

	useEffect(() => {
		if (isEditingSlug) {
			slugRef.current?.querySelector('input')?.focus();
		}
	}, [isEditingSlug]);

	return (
		<div className="lzb-block-builder-block-card">
			{icon ? (
				<div className="lzb-block-builder-block-card-icon-wrap">
					{icon}
				</div>
			) : null}
			<div className="lzb-block-builder-block-card-content">
				<h2 className="lzb-block-builder-block-card-title">
					{title || __('(no title)', 'lazy-blocks')}
				</h2>
				{data.description ? (
					<p className="lzb-block-builder-block-card-description">
						{data.description}
					</p>
				) : null}
				{showSlugControl ? (
					<div
						ref={slugRef}
						className="lzb-block-builder-block-card-slug-edit"
						onKeyDown={(event) => {
							if (
								isSlugValid &&
								(event.key === 'Enter' ||
									event.key === 'Escape') &&
								event.target.tagName === 'INPUT'
							) {
								event.preventDefault();
								setIsEditingSlug(false);
							}
						}}
					>
						<div>
							{slug}
							{data.slug && !isSlugValid ? (
								<Notice
									status="error"
									isDismissible={false}
									className="lzb-block-builder-notice"
								>
									{__(
										'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block',
										'lazy-blocks'
									)}
								</Notice>
							) : null}
						</div>
						{isSlugValid ? (
							<Button
								size="small"
								icon={checkIcon}
								label={__('Done', 'lazy-blocks')}
								onClick={() => setIsEditingSlug(false)}
							/>
						) : null}
					</div>
				) : null}
				{slug && !showSlugControl ? (
					<div className="lzb-block-builder-block-card-slug">
						<code>{getSlugWithNamespace(data.slug)}</code>
						<Button
							size="small"
							icon={editIcon}
							label={__('Edit slug', 'lazy-blocks')}
							onClick={() => setIsEditingSlug(true)}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default function GeneralSettings({ data, updateData }) {
	const { slug, icon, category, description, keywords } = data;

	const settingsData = { data, updateData };

	// The filters keep their names and arguments. The default elements are not
	// wrapped in a PanelBody any more: the slug and the icon live in the block
	// card, the other settings in the General panel.
	const settingsSlug = applyFilters(
		`lzb.constructor.general-settings.slug`,
		<BlockSlugControl
			label={__('Slug', 'lazy-blocks')}
			value={slug}
			onChange={(val) => updateData({ slug: val })}
			hideLabelFromVision
		/>,
		settingsData
	);

	const settingsIcon = applyFilters(
		`lzb.constructor.general-settings.icon`,
		<IconSettingsControl
			value={icon}
			onChange={(value) => updateData({ icon: value })}
		/>,
		settingsData
	);

	const settingsCategory = applyFilters(
		`lzb.constructor.general-settings.category`,
		<CategorySettingsControl
			value={category}
			onChange={(val) => updateData({ category: val })}
		/>,
		settingsData
	);

	const settingsKeywords = applyFilters(
		`lzb.constructor.general-settings.keywords`,
		<KeywordsSettingsControl
			value={keywords}
			onChange={(val) => updateData({ keywords: val })}
		/>,
		settingsData
	);

	const settingsDescription = applyFilters(
		`lzb.constructor.general-settings.description`,
		<TextareaControl
			label={__('Description', 'lazy-blocks')}
			value={description}
			onChange={(value) => updateData({ description: value })}
			__nextHasNoMarginBottom
		/>,
		settingsData
	);

	return (
		<>
			<BlockCard
				data={data}
				icon={settingsIcon || null}
				slug={settingsSlug || null}
			/>
			{settingsCategory || settingsKeywords || settingsDescription ? (
				<PanelBody title={__('General', 'lazy-blocks')}>
					<div className="lzb-block-builder-control-group">
						{settingsCategory || null}
						{settingsKeywords || null}
						{settingsDescription || null}
					</div>
				</PanelBody>
			) : null}
		</>
	);
}
