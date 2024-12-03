/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	RadioControl,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import ColorControl from './color-control';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.color.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props)}>
		<ColorControl
			label={props.data.alongside_text}
			alpha={props.data.alpha === 'true'}
			palette={props.data.palette === 'true'}
			value={props.getValue()}
			onChange={props.onChange}
		/>
	</BaseControl>
));

/**
 * Required check.
 *
 * @param {Object} validationData
 * @param {number} value
 *
 * @return {Object} validation data.
 */
function validate(validationData, value) {
	if (!value) {
		return {
			valid: false,
			message: 'Please choose a color.',
		};
	}

	return validationData;
}
addFilter('lzb.editor.control.color.validate', 'lzb.editor', validate);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.color.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Alongside Text', 'lazy-blocks')}
						help={__(
							'Displays text alongside the color indicator',
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
						id="lazyblocks-control-color-alpha"
						label={__('Alpha Channel', 'lazy-blocks')}
						help={__(
							'Allow set semi-transparent colors',
							'lazy-blocks'
						)}
					>
						<ToggleControl
							id="lazyblocks-control-color-alpha"
							label={__('Yes', 'lazy-blocks')}
							checked={data.alpha === 'true'}
							onChange={(value) =>
								updateData({ alpha: value ? 'true' : 'false' })
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
					<BaseControl
						id="lazyblocks-control-color-palette"
						label={__('Color Palette', 'lazy-blocks')}
						help={__(
							'Display color palette with predefined colors',
							'lazy-blocks'
						)}
					>
						<ToggleControl
							id="lazyblocks-control-color-palette"
							label={__('Yes', 'lazy-blocks')}
							checked={data.palette === 'true'}
							onChange={(value) =>
								updateData({
									palette: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lazyblocks-control-color-output-format"
						label={__('Output Format', 'lazy-blocks')}
						help={__(
							'Allows you to change attribute output format',
							'lazy-blocks'
						)}
					>
						<RadioControl
							options={[
								{
									label: __('Color', 'lazy-blocks'),
									value: '',
								},
								{
									label: __(
										'Array (Color + Slug)',
										'lazy-blocks'
									),
									value: 'array',
								},
							]}
							selected={data.output_format || ''}
							onChange={(value) =>
								updateData({ output_format: value })
							}
						/>
					</BaseControl>
				</PanelBody>
			</>
		);
	}
);
