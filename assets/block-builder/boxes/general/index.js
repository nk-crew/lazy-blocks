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

export default function GeneralSettings({ data, updateData }) {
	const [isSlugValid, setIsSlugValid] = useState(true);

	const { slug, icon, category, description, keywords } = data;

	useEffect(() => {
		if (!slug) {
			return;
		}

		const isValid = checkValidSlug(slug);

		if (isValid !== isSlugValid) {
			setIsSlugValid(isValid);
		}
	}, [isSlugValid, slug]);

	const { categories } = useSelect(
		(select) => ({
			categories: select('core/blocks').getCategories(),
		}),
		[]
	);

	let thereIsSelectedCat = false;
	const categoriesOpts = categories.map((cat) => {
		if (cat.slug === category) {
			thereIsSelectedCat = true;
		}
		return {
			value: cat.slug,
			label: cat.title,
		};
	});
	if (!thereIsSelectedCat) {
		categoriesOpts.push({
			value: category,
			label: category,
		});
	}

	const settingsData = { data, updateData };

	const settingsSlug = applyFilters(
		`lzb.constructor.general-settings.slug`,
		<PanelBody>
			<BlockSlugControl
				label={__('Slug', 'lazy-blocks')}
				value={slug}
				onChange={(value) => updateData({ slug: value })}
			/>
			{!isSlugValid ? (
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
			) : (
				''
			)}
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
						(option) => option.value === category
					)}
					options={categoriesOpts}
					onChange={({ value }) => updateData({ category: value })}
				/>
			</BaseControl>
		</PanelBody>,
		settingsData
	);

	const settingsKeywords = applyFilters(
		`lzb.constructor.general-settings.keywords`,
		<PanelBody>
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
					placeholder={__(
						'Type keyword and push Enter',
						'lazy-blocks'
					)}
					value={(() => {
						if (keywords) {
							const result = keywords.split(',').map((val) => ({
								value: val,
								label: val,
							}));
							return result;
						}
						return [];
					})()}
					onChange={(value) => {
						let result = '';

						if (value) {
							value.forEach((optionData) => {
								if (optionData) {
									if (result) {
										result += ',';
									}

									result += optionData.value;
								}
							});
						}

						updateData({ keywords: result });
					}}
				/>
			</BaseControl>
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
