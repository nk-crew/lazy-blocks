/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, TextControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.number.render', 'lzb.editor', (render, props) => {
	const maxlength = props.data.characters_limit
		? parseInt(props.data.characters_limit, 10)
		: '';

	return (
		<BaseControl {...useBlockControlProps(props, { label: false })}>
			<TextControl
				type="number"
				label={props.data.label}
				maxLength={maxlength}
				min={props.data.min}
				max={props.data.max}
				step={props.data.step}
				placeholder={props.data.placeholder}
				value={props.getValue()}
				onChange={(val) => {
					props.onChange(parseFloat(val));
				}}
			/>
		</BaseControl>
	);
});

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.number.settings',
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
				<PanelBody>
					<TextControl
						label={__('Placeholder', 'lazy-blocks')}
						value={data.placeholder}
						onChange={(value) => updateData({ placeholder: value })}
					/>
				</PanelBody>
			</>
		);
	}
);
