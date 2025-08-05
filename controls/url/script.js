/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { useState } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

function ComponentRender(props) {
	const [key, setKey] = useState(shorthash.unique(`${new Date()}`));

	// Call hooks at the top level, before any conditional logic.
	const baseControlProps = useBlockControlProps(props);
	const baseControlPropsWithoutLabel = useBlockControlProps(props, {
		label: false,
	});

	// If placement is 'content', render TextControl instead of LinkControl.
	if (props.placement === 'content') {
		const maxlength = props.data.characters_limit
			? parseInt(props.data.characters_limit, 10)
			: '';

		return (
			<BaseControl {...baseControlPropsWithoutLabel}>
				<TextControl
					label={props.data.label}
					maxLength={maxlength}
					placeholder={props.data.placeholder}
					value={props.getValue()}
					onChange={props.onChange}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		);
	}

	// Default LinkControl render for other placements.
	return (
		<BaseControl {...baseControlProps}>
			<LinkControl
				key={key}
				className="wp-block-navigation-link__inline-link-input"
				opensInNewTab={false}
				value={{
					url: props.getValue(),
				}}
				onChange={({ url: newURL = '' }) => {
					props.onChange(newURL);
				}}
				onRemove={() => {
					props.onChange('');
					setKey(shorthash.unique(`${new Date()}`));
				}}
			/>
		</BaseControl>
	);
}

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.url.render', 'lzb.editor', (render, props) => (
	<ComponentRender {...props} />
));

/**
 * Required check.
 * Just check for empty value. Previously we used advanced URL validation, but we can't restrict values like '#' or 'relative-url-string'.
 *
 * @param {Object} validationData
 * @param {number} value
 *
 * @return {Object} validation data.
 */
function validate(validationData, value) {
	if (!value) {
		return { valid: false };
	}

	return validationData;
}
addFilter('lzb.editor.control.url.validate', 'lzb.editor', validate);
