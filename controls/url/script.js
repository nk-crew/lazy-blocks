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

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

function ComponentRender(props) {
	const [key, setKey] = useState(shorthash.unique(`${new Date()}`));

	return (
		<BaseControl {...useBlockControlProps(props)}>
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
