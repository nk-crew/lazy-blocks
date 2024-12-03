/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.toggle.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props)}>
		<ToggleControl
			label={props.data.alongside_text}
			checked={!!props.getValue()}
			onChange={props.onChange}
			__nextHasNoMarginBottom
		/>
	</BaseControl>
));

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.toggle.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Alongside Text', 'lazy-blocks')}
						help={__(
							'Displays text alongside the toggle',
							'lazy-blocks'
						)}
						value={data.alongside_text}
						onChange={(value) =>
							updateData({ alongside_text: value })
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<BaseControl
						label={__('Checked', 'lazy-blocks')}
						id="lzb-control-toggle-checked"
					>
						<ToggleControl
							label={__('Yes', 'lazy-blocks')}
							id="lzb-control-toggle-checked"
							checked={data.checked === 'true'}
							onChange={(value) =>
								updateData({
									checked: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
				</PanelBody>
			</>
		);
	}
);
