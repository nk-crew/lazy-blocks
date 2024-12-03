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
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</BaseControl>
	);
});

/**
 * Required check.
 *
 * @param {Object} validationData
 * @param {number} value
 * @param {Object} data
 *
 * @return {Object} validation data.
 */
function validate(validationData, value, data) {
	if (value === '' || isNaN(value)) {
		return { valid: false };
	}

	if (data.min !== '' && value < parseInt(data.min, 10)) {
		return {
			valid: false,
			message: `Value must be greater than or equal to ${parseInt(
				data.min,
				10
			)}.`,
		};
	}

	if (data.max !== '' && value > parseInt(data.max, 10)) {
		return {
			valid: false,
			message: `Value must be less than or equal to ${parseInt(
				data.max,
				10
			)}.`,
		};
	}

	return validationData;
}
addFilter('lzb.editor.control.number.validate', 'lzb.editor', validate);
addFilter('lzb.editor.control.range.validate', 'lzb.editor', validate);

/**
 * Control settings render in block builder.
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
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Maximum Value', 'lazy-blocks')}
						type="number"
						step={data.step}
						value={data.max}
						onChange={(value) => updateData({ max: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Step Size', 'lazy-blocks')}
						type="number"
						value={data.step}
						onChange={(value) => updateData({ step: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Placeholder', 'lazy-blocks')}
						value={data.placeholder}
						onChange={(value) => updateData({ placeholder: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</>
		);
	}
);
