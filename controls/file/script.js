/* eslint-disable no-param-reassign */
/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import Select from '../../assets/components/select';
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import FileControl from './file-control';

const { allowed_mime_types: wpAllowedMimeTypes } =
	window.lazyblocksBlockBuilderData || window.lazyblocksGutenberg;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.file.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props)}>
		<FileControl
			label={props.data.label}
			allowedMimeTypes={props.data.allowed_mime_types}
			value={props.getValue()}
			onChange={(val) => {
				const result = val
					? {
							alt: val.alt || '',
							title: val.title || '',
							caption: val.caption || '',
							id: val.id || '',
							link: val.link || '',
							url: val.url || '',
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
addFilter('lzb.editor.control.file.getValue', 'lzb.editor', (value) => {
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
addFilter('lzb.editor.control.file.updateValue', 'lzb.editor', (value) => {
	// change array value to string.
	if (typeof value === 'object' || Array.isArray(value)) {
		value = encodeURI(JSON.stringify(value));
	}

	return value;
});

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.file.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		const options = Object.keys(wpAllowedMimeTypes).map((typeName) => ({
			label: typeName,
			value: typeName,
		}));

		return (
			<PanelBody>
				<BaseControl
					id="lazyblocks-control-file-mime-types"
					label={__('Allowed Mime Types', 'lazy-blocks')}
					help={__(
						'If nothing selected, all file types will be allowed to use.',
						'lazy-blocks'
					)}
				>
					<Select
						isMulti
						options={options}
						value={(() => {
							if (
								data.allowed_mime_types &&
								Array.isArray(data.allowed_mime_types)
							) {
								const result = data.allowed_mime_types.map(
									(val) => ({
										value: val,
										label: val,
									})
								);
								return result;
							}
							return [];
						})()}
						onChange={(value) => {
							const result = [];

							if (value) {
								value.forEach((optionData) => {
									result.push(optionData.value);
								});
							}

							updateData({ allowed_mime_types: result });
						}}
					/>
				</BaseControl>
			</PanelBody>
		);
	}
);
