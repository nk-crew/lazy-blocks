/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, TextControl, CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.checkbox.render',
	'lzb.editor',
	(render, props) => (
		<BaseControl {...useBlockControlProps(props)}>
			<CheckboxControl
				label={props.data.alongside_text}
				checked={!!props.getValue()}
				onChange={props.onChange}
			/>
		</BaseControl>
	)
);

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.checkbox.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Alongside Text', 'lazy-blocks')}
						help={__(
							'Displays text alongside the checkbox',
							'lazy-blocks'
						)}
						value={data.alongside_text}
						onChange={(value) =>
							updateData({ alongside_text: value })
						}
					/>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lazyblocks-control-checkbox-checked"
						label={__('Checked', 'lazy-blocks')}
					>
						<CheckboxControl
							id="lazyblocks-control-checkbox-checked"
							label={__('Yes', 'lazy-blocks')}
							checked={data.checked === 'true'}
							onChange={(value) =>
								updateData({
									checked: value ? 'true' : 'false',
								})
							}
						/>
					</BaseControl>
				</PanelBody>
			</>
		);
	}
);
