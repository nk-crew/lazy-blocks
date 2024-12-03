/* eslint-disable no-param-reassign */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import GalleryControl from './gallery-control';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.gallery.render',
	'lzb.editor',
	(render, props) => (
		<GalleryControl
			label={props.data.label}
			help={props.data.help}
			previewSize={props.data.preview_size}
			value={props.getValue()}
			controlProps={props}
			onChange={(val) => {
				const result = val.map((image) => ({
					alt: image.alt || '',
					title: image.title || '',
					caption: image.caption || '',
					description: image.description || '',
					id: image.id || '',
					link: image.link || '',
					url: image.url || '',
					sizes: image.sizes || '',
				}));

				props.onChange(result);
			}}
		/>
	)
);

/**
 * getValue filter in editor.
 */
addFilter('lzb.editor.control.gallery.getValue', 'lzb.editor', (value) => {
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
addFilter('lzb.editor.control.gallery.updateValue', 'lzb.editor', (value) => {
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
 * @return {JSX} - component output.
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
	);
}

addFilter(
	'lzb.constructor.control.gallery.settings',
	'lzb.constructor',
	(render, props) => <AdditionalAttributes {...props} />
);
