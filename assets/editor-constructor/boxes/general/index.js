/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useRef, useState, useEffect } from '@wordpress/element';
import {
	PanelBody,
	BaseControl,
	TextareaControl,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import BlockSlugControl from '../../../components/block-slug';
import IconPicker from '../../../components/icon-picker';
import Select from '../../../components/select';

function checkValidSlug(slug) {
	return /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(`lazyblock/${slug}`);
}

export default function GeneralSettings({ data, updateData }) {
	const [isSlugValid, setIsSlugValid] = useState(true);

	const { slug, icon, category, description, keywords } = data;

	const canCheckSlug = useRef(!!slug);

	useEffect(() => {
		// We shouldn't check slug when first time created block, as user is not yet added the block name.
		if (!canCheckSlug.current) {
			canCheckSlug.current = true;
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

	return (
		<>
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
						className="lzb-constructor-notice"
					>
						{__(
							'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block',
							'lazy-blocks'
						)}
					</Notice>
				) : (
					''
				)}
			</PanelBody>
			<PanelBody>
				<IconPicker
					label={__('Icon', 'lazy-blocks')}
					value={icon}
					onChange={(value) => updateData({ icon: value })}
				/>
			</PanelBody>
			<PanelBody>
				<BaseControl
					id="lazyblocks-boxes-general-category"
					label={__('Category', 'lazy-blocks')}
				>
					<Select
						id="lazyblocks-boxes-general-category"
						isCreatable
						placeholder={__('Select category', 'lazy-blocks')}
						value={categoriesOpts.filter(
							(option) => option.value === category
						)}
						options={categoriesOpts}
						onChange={({ value }) =>
							updateData({ category: value })
						}
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
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
						placeholder={__(
							'Type keyword and push Enter',
							'lazy-blocks'
						)}
						value={(() => {
							if (keywords) {
								const result = keywords
									.split(',')
									.map((val) => ({
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
			</PanelBody>
			<PanelBody>
				<TextareaControl
					label={__('Description', 'lazy-blocks')}
					value={description}
					onChange={(value) => updateData({ description: value })}
				/>
			</PanelBody>
		</>
	);
}
