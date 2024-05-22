/**
 * WordPress dependencies.
 */
import { addFilter } from '@wordpress/hooks';
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.rich_text.render',
	'lzb.editor',
	(render, props) => (
		<BaseControl key={props.data.name} {...useBlockControlProps(props)}>
			<RichText
				inlineToolbar
				format="string"
				value={props.getValue()}
				onChange={(val) => {
					props.onChange(val);
				}}
			/>
		</BaseControl>
	)
);
