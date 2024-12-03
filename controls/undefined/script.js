/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.undefined.render',
	'lzb.editor',
	(render, props) => {
		return (
			<BaseControl
				{...useBlockControlProps(props, { label: false, help: false })}
			>
				{__('Looks like this control does not exists.', 'lazy-blocks')}
			</BaseControl>
		);
	}
);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.undefined.settings',
	'lzb.constructor',
	() => {
		return (
			<PanelBody>
				{__('Looks like this control does not exists.', 'lazy-blocks')}
			</PanelBody>
		);
	}
);
