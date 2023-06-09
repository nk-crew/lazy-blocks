/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, RangeControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.range.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props, { label: false })}>
		<RangeControl
			label={props.data.label}
			min={props.data.min}
			max={props.data.max}
			step={props.data.step}
			value={props.getValue()}
			onChange={(val) => {
				props.onChange(parseFloat(val));
			}}
		/>
	</BaseControl>
));

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.range.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Minimum Value', 'lazy-blocks')}
						type="number"
						step={data.step}
						value={data.min}
						onChange={(value) => updateData({ min: value })}
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Maximum Value', 'lazy-blocks')}
						type="number"
						step={data.step}
						value={data.max}
						onChange={(value) => updateData({ max: value })}
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Step Size', 'lazy-blocks')}
						type="number"
						value={data.step}
						onChange={(value) => updateData({ step: value })}
					/>
				</PanelBody>
			</>
		);
	}
);
