/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, ToggleControl } from '@wordpress/components';
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
				multiline={props.data.multiline === 'true' ? 'p' : false}
				value={props.getValue()}
				onChange={(val) => {
					props.onChange(val);
				}}
			/>
		</BaseControl>
	)
);

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.rich_text.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<PanelBody>
				<ToggleControl
					label={__('Multiline', 'lazy-blocks')}
					checked={data.multiline === 'true'}
					onChange={(value) =>
						updateData({ multiline: value ? 'true' : 'false' })
					}
				/>
			</PanelBody>
		);
	}
);
