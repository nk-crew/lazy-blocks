/* eslint-disable no-param-reassign */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	RadioControl,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import ComponentChoices from './component-choices';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.select.render', 'lzb.editor', (render, props) => {
	let { choices } = props.data;

	// allow null.
	if (props.data.allow_null && props.data.allow_null === 'true') {
		choices = [
			{
				value: '',
				label: __('-- Select --', 'lazy-blocks'),
			},
			...choices,
		];
	}

	return (
		<BaseControl {...useBlockControlProps(props, { label: false })}>
			<SelectControl
				label={props.data.label}
				options={choices}
				multiple={props.data.multiple === 'true'}
				value={props.getValue()}
				onChange={(val) => {
					props.onChange(val);
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
	if (data.allow_null === 'true') {
		return { valid: true };
	}

	if (!value || (data.multiple === 'true' && !value.length)) {
		return {
			valid: false,
			message: 'Please select an item in the list.',
		};
	}

	return validationData;
}
addFilter('lzb.editor.control.select.validate', 'lzb.editor', validate);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.select.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;
		const { choices } = data;

		return (
			<>
				<PanelBody>
					<ComponentChoices
						value={choices}
						onChange={(val) => updateData({ choices: val })}
					/>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lzb-control-select-allow-null"
						label={__('Allow Null', 'lazy-blocks')}
						help={__(
							'Allows you to reset selected option value to null',
							'lazy-blocks'
						)}
					>
						<ToggleControl
							id="lzb-control-select-allow-null"
							label={__('Yes', 'lazy-blocks')}
							checked={data.allow_null === 'true'}
							onChange={(value) =>
								updateData({
									allow_null: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lzb-control-select-multiple"
						label={__('Multiple', 'lazy-blocks')}
						help={__(
							'Allows you to select multiple values',
							'lazy-blocks'
						)}
					>
						<ToggleControl
							id="lzb-control-select-multiple"
							label={__('Yes', 'lazy-blocks')}
							checked={data.multiple === 'true'}
							onChange={(value) =>
								updateData({
									multiple: value ? 'true' : 'false',
								})
							}
							__nextHasNoMarginBottom
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lzb-control-select-output-format"
						label={__('Output Format', 'lazy-blocks')}
						help={__(
							'Allows you to change attribute output format',
							'lazy-blocks'
						)}
					>
						<RadioControl
							options={[
								{
									label: __('Value', 'lazy-blocks'),
									value: '',
								},
								{
									label: __('Label', 'lazy-blocks'),
									value: 'label',
								},
								{
									label: __('Both (Array)', 'lazy-blocks'),
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
