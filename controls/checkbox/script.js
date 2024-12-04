/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	PanelBody,
	TextControl,
	CheckboxControl,
	ToggleControl,
	RadioControl,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

import ComponentChoices from '../select/component-choices';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.checkbox.render',
	'lzb.editor',
	(render, props) => {
		const { choices } = props.data;

		// Return null if multiple is true and no choices available.
		if (props.data.multiple === 'true' && (!choices || !choices.length)) {
			return null;
		}

		const val = props.getValue();

		// Multiple checkbox.
		if (props.data.multiple === 'true') {
			return (
				<BaseControl {...useBlockControlProps(props)}>
					{choices.map((choice) => (
						<CheckboxControl
							key={choice.value}
							label={choice.label}
							checked={val.includes(choice.value)}
							onChange={(checked) => {
								const index = val.indexOf(choice.value);

								// Only create new array when needed
								const newVal =
									checked && index === -1
										? [...val, choice.value]
										: [...val];

								if (!checked && index !== -1) {
									newVal.splice(index, 1);
								}

								// Create index map once for more efficient sorting
								const indexMap = new Map(
									choices.map((c, i) => [c.value, i])
								);

								newVal.sort((a, b) => {
									const indexA = indexMap.get(a) ?? 0;
									const indexB = indexMap.get(b) ?? 0;
									return indexA - indexB;
								});

								props.onChange(newVal);
							}}
							__nextHasNoMarginBottom
						/>
					))}
				</BaseControl>
			);
		}

		return (
			<BaseControl {...useBlockControlProps(props)}>
				<CheckboxControl
					label={props.data.alongside_text}
					checked={!!val}
					onChange={props.onChange}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		);
	}
);

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
	if (!value || (data.multiple === 'true' && !value.length)) {
		return {
			valid: false,
			message: 'Please tick this box if you want to proceed.',
		};
	}

	return validationData;
}
addFilter('lzb.editor.control.checkbox.validate', 'lzb.editor', validate);
addFilter('lzb.editor.control.toggle.validate', 'lzb.editor', validate);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.checkbox.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				{data.multiple !== 'true' && (
					<PanelBody>
						<div className="lzb-block-builder-controls-item-settings-choices">
							<div className="lzb-block-builder-controls-item-settings-choices-items">
								<TextControl
									placeholder={__(
										'Alongside Text',
										'lazy-blocks'
									)}
									value={data.alongside_text}
									onChange={(value) =>
										updateData({
											alongside_text: value,
										})
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</div>
							<div>
								<CheckboxControl
									id="lazyblocks-control-checkbox-checked"
									label={
										data.checked === 'true'
											? __(
													'Checked by default',
													'lazy-blocks'
												)
											: __(
													'Unchecked by default',
													'lazy-blocks'
												)
									}
									checked={data.checked === 'true'}
									onChange={(value) =>
										updateData({
											checked: value ? 'true' : 'false',
										})
									}
									__nextHasNoMarginBottom
								/>
							</div>
						</div>
					</PanelBody>
				)}
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
				{data.multiple === 'true' && (
					<>
						<PanelBody>
							<ComponentChoices
								value={data.choices}
								onChange={(val) => updateData({ choices: val })}
							/>
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
											label: __(
												'Both (Array)',
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
				)}
			</>
		);
	}
);
