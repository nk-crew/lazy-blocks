/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, ToggleControl, RadioControl } from '@wordpress/components';

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
			alpha={props.data.alpha === 'true'}
			value={props.getValue()}
			onChange={props.onChange}
		/>
	</BaseControl>
));

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.color.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<BaseControl
						id="lazyblocks-control-color-alpha"
						label={__('Alpha Channel', 'lazy-blocks')}
						help={__(
							'Will be added option that allow you to set semi-transparent colors with rgba',
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
