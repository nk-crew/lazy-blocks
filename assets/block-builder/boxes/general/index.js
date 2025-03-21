/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import {
	PanelBody,
	BaseControl,
	TextareaControl,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import BlockSlugControl from '../../../components/block-slug';
import IconPicker from '../../../components/icon-picker';
import Select from '../../../components/select';

function checkValidSlug(slug) {
	return /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(
		slug.includes('/') ? slug : `lazyblock/${slug}`
	);
}

export const SlugSettingsControl = ({ value, onChange }) => {
	const [isSlugValid, setIsSlugValid] = useState(true);

	useEffect(() => {
		if (!value) {
			return;
		}

		const isValid = checkValidSlug(value);

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
			__nextHasNoMarginBottom
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
			__nextHasNoMarginBottom
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

export default function GeneralSettings({ data, updateData }) {
	const { slug, icon, category, description, keywords } = data;

	const settingsData = { data, updateData };

	const settingsSlug = applyFilters(
		`lzb.constructor.general-settings.slug`,
		<PanelBody>
			<SlugSettingsControl
				value={slug}
				onChange={(val) => updateData({ slug: val })}
			/>
		</PanelBody>,
		settingsData
	);

	const settingsIcon = applyFilters(
		`lzb.constructor.general-settings.icon`,
		<PanelBody>
			<IconPicker
				label={__('Icon', 'lazy-blocks')}
				value={icon}
				onChange={(value) => updateData({ icon: value })}
			/>
		</PanelBody>,
		settingsData
	);

	const settingsCategory = applyFilters(
		`lzb.constructor.general-settings.category`,
		<PanelBody>
			<CategorySettingsControl
				value={category}
				onChange={(val) => updateData({ category: val })}
			/>
		</PanelBody>,
		settingsData
	);

	const settingsKeywords = applyFilters(
		`lzb.constructor.general-settings.keywords`,
		<PanelBody>
			<KeywordsSettingsControl
				value={keywords}
				onChange={(val) => updateData({ keywords: val })}
			/>
		</PanelBody>,
		settingsData
	);

	const settingsDescription = applyFilters(
		`lzb.constructor.general-settings.description`,
		<PanelBody>
			<TextareaControl
				label={__('Description', 'lazy-blocks')}
				value={description}
				onChange={(value) => updateData({ description: value })}
				__nextHasNoMarginBottom
			/>
		</PanelBody>,
		settingsData
	);

	return (
		<>
			{settingsSlug || null}
			{settingsIcon || null}
			{settingsCategory || null}
			{settingsKeywords || null}
			{settingsDescription || null}
		</>
	);
}
