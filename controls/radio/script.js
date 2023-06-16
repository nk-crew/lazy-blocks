/* eslint-disable no-param-reassign */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, RadioControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import ComponentChoices from '../select/component-choices';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.radio.render', 'lzb.editor', (render, props) => (
	<BaseControl {...useBlockControlProps(props, { label: false })}>
		<RadioControl
			label={props.data.label}
			selected={props.getValue()}
			options={props.data.choices}
			onChange={props.onChange}
		/>
	</BaseControl>
));

/**
 * Control value valid in editor.
 */
addFilter(
	'lzb.editor.control.radio.isValueValid',
	'lzb.editor',
	(isValid, value, data) => {
		if (data.allow_null === 'true') {
			isValid = true;
		}

		return isValid;
	}
);

/**
 * Control settings render in constructor.
 */
addFilter(
	'lzb.constructor.control.radio.settings',
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
						id="lazyblocks-control-radio-allow-null"
						label={__('Allow Null', 'lazy-blocks')}
						help={__(
							'Allows you to reset selected option value to null',
							'lazy-blocks'
						)}
					>
						<ToggleControl
							id="lazyblocks-control-radio-allow-null"
							label={__('Yes', 'lazy-blocks')}
							checked={data.allow_null === 'true'}
							onChange={(value) =>
								updateData({
									allow_null: value ? 'true' : 'false',
								})
							}
						/>
					</BaseControl>
				</PanelBody>
				<PanelBody>
					<BaseControl
						id="lazyblocks-control-radio-output-format"
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
