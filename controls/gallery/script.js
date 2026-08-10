/* eslint-disable no-param-reassign */
/**
 * WordPress dependencies.
 */

import { BaseControl, PanelBody, TextControl } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import GalleryControl, {
	DEFAULT_PREVIEW_ROWS,
	MAX_PREVIEW_COLUMNS,
	MAX_PREVIEW_ROWS,
} from './gallery-control';

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
			previewRows={props.data.preview_rows}
			previewColumns={props.data.preview_columns}
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
		} catch (_e) {
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

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-control-gallery-preview-grid"
				label={__('Preview Grid', 'lazy-blocks')}
				help={__(
					'Images which do not fit the grid are replaced with a counter. Leave the columns empty to fit the control width.',
					'lazy-blocks'
				)}
				__nextHasNoMarginBottom
			>
				<div className="lzb-block-builder-controls-item-settings-grid">
					<TextControl
						type="number"
						label={__('Columns', 'lazy-blocks')}
						placeholder={__('Auto', 'lazy-blocks')}
						min={1}
						max={MAX_PREVIEW_COLUMNS}
						value={data.preview_columns}
						onChange={(value) =>
							updateData({ preview_columns: value })
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<span aria-hidden="true">×</span>
					<TextControl
						type="number"
						label={__('Rows', 'lazy-blocks')}
						placeholder={DEFAULT_PREVIEW_ROWS}
						min={1}
						max={MAX_PREVIEW_ROWS}
						value={data.preview_rows}
						onChange={(value) =>
							updateData({ preview_rows: value })
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.gallery.settings',
	'lzb.constructor',
	(render, props) => <AdditionalAttributes {...props} />
);
