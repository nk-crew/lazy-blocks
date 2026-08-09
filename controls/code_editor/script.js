/**
 * WordPress dependencies.
 */

import { PlainText } from '@wordpress/blockEditor';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.code_editor.render',
	'lzb.editor',
	(render, props) => (
		<BaseControl {...useBlockControlProps(props)}>
			<PlainText
				value={props.getValue()}
				onChange={(val) => {
					props.onChange(val);
				}}
			/>
		</BaseControl>
	)
);
