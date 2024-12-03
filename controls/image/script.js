/* eslint-disable no-param-reassign */
/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import ImageControl from './image-control';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.image.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props)}>
		<ImageControl
			previewSize={props.data.preview_size}
			allowInsertFromURL={props.data.insert_from_url === 'true'}
			value={props.getValue()}
			onChange={(val) => {
				const result = val
					? {
							alt: val.alt || '',
							title: val.title || '',
							caption: val.caption || '',
							description: val.description || '',
							id: val.id || '',
							link: val.link || '',
							url: val.url || '',
							sizes: val.sizes || '',
						}
					: '';

				props.onChange(result);
			}}
		/>
	</BaseControl>
));

/**
 * getValue filter in editor.
 */
addFilter('lzb.editor.control.image.getValue', 'lzb.editor', (value) => {
	// change string value to array.
	if (typeof value === 'string') {
		try {
			// WPML decodes string in a different way, so we have to use decodeURIComponent
			// when string does not contains ':'.
			if (value.includes(':')) {
				value = JSON.parse(decodeURI(value));
			} else {
				value = JSON.parse(decodeURIComponent(value));
			}
		} catch (e) {
			value = [];
		}
	}

	return value;
});

/**
 * updateValue filter in editor.
 */
addFilter('lzb.editor.control.image.updateValue', 'lzb.editor', (value) => {
	// change array value to string.
	if (typeof value === 'object' || Array.isArray(value)) {
		value = encodeURI(JSON.stringify(value));
	}

	return value;
});

/**
 * Control settings render in block builder.
 *
 * @param {Object} props - component props.
 *
 * @return {JSX} - component render.
 */
function AdditionalAttributes(props) {
	const { updateData, data } = props;

	const { imageSizes, imageDimensions } = useSelect((select) => {
		const { getSettings } = select('core/block-editor');
		const editorSettings = getSettings();

		return {
			imageSizes: editorSettings.imageSizes || [
				{
					name: __('Medium', 'lazy-blocks'),
					slug: 'medium',
				},
			],
			imageDimensions: editorSettings.imageDimensions || {
				medium: {
					width: 300,
					height: 300,
				},
			},
		};
	});

	return (
		<>
			<PanelBody>
				<BaseControl
					id="lazyblocks-control-image-insert-from-url"
					label={__('Allow insert from URL', 'lazy-blocks')}
					help={__(
						'Will be added option that allow you to use custom URL to insert image',
						'lazy-blocks'
					)}
				>
					<ToggleControl
						id="lazyblocks-control-image-insert-from-url"
						label={__('Yes', 'lazy-blocks')}
						checked={data.insert_from_url === 'true'}
						onChange={(value) =>
							updateData({
								insert_from_url: value ? 'true' : 'false',
							})
						}
						__nextHasNoMarginBottom
					/>
				</BaseControl>
			</PanelBody>
			<PanelBody>
				<SelectControl
					label={__('Preview Size', 'lazy-blocks')}
					options={imageSizes.map((sizeData) => {
						let sizeLabel = sizeData.name;

						if (imageDimensions[sizeData.slug]) {
							sizeLabel += ` (${
								imageDimensions[sizeData.slug].width
							} × ${imageDimensions[sizeData.slug].height})`;
						}

						return {
							label: sizeLabel,
							value: sizeData.slug,
						};
					})}
					value={data.preview_size || 'medium'}
					onChange={(value) => updateData({ preview_size: value })}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</PanelBody>
		</>
	);
}

addFilter(
	'lzb.constructor.control.image.settings',
	'lzb.constructor',
	(render, props) => <AdditionalAttributes {...props} />
);
