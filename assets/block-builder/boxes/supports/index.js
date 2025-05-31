/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { BaseControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import Select from '../../../components/select';

// Helper function to create select options
function createSelectOptions(options) {
	return options.map((option) => ({
		value: option,
		label: option,
	}));
}

// Helper function to convert object to select values
function objectToSelectValues(obj) {
	if (!obj || typeof obj !== 'object') {
		return [];
	}

	return Object.entries(obj)
		.filter(([, val]) => val)
		.map(([key]) => ({
			value: key,
			label: key,
		}));
}

// Helper function to convert array to select values
function arrayToSelectValues(arr) {
	if (!arr || !Array.isArray(arr)) {
		return [];
	}

	return arr.map((val) => ({
		value: val,
		label: val,
	}));
}

// Helper function to update object-based supports
function updateObjectSupports(
	allOptions,
	selectedValues,
	updateData,
	supportKey
) {
	if (selectedValues && selectedValues.length > 0) {
		const selected = selectedValues.map((v) => v.value);
		const result = {};
		allOptions.forEach((option) => {
			result[option] = selected.includes(option);
		});
		// If all are false, save as false
		const allFalse = Object.values(result).every((v) => !v);
		updateData({
			[supportKey]: allFalse ? false : result,
		});
	} else {
		updateData({ [supportKey]: false });
	}
}

export default function SupportsSettings(props) {
	const { data, updateData } = props;

	const {
		supports_color: supportsColor,
		supports_typography: supportsTypography,
		supports_spacing: supportsSpacing,
		supports_dimensions: supportsDimensions,
		supports_shadow: supportsShadow,
		supports_layout: supportsLayout,
		supports_align: supportsAlign,
		supports_anchor: supportsAnchor,
		supports_classname: supportsClassname,
		supports_multiple: supportsMultiple,
		supports_inserter: supportsInserter,
		supports_reusable: supportsReusable,
		supports_lock: supportsLock,
	} = data;

	const colorOptions = [
		'background',
		'heading',
		'text',
		'link',
		'button',
		'gradients',
		'enableContrastChecker',
	];

	const layoutOptions = [
		'allowSwitching',
		'allowEditing',
		'allowInheriting',
		'allowSizingOnChildren',
		'allowVerticalAlignment',
		'allowJustification',
		'allowOrientation',
		'allowCustomContentAndWideSize',
	];

	const spacingOptions = ['margin', 'padding', 'blockGap'];

	const dimensionsOptions = ['aspectRatio', 'minHeight'];

	const typographyOptions = [
		'fontSize',
		'lineHeight',
		'textAlign',
		'fontFamily',
		'textDecoration',
		'fontStyle',
		'fontWeight',
		'letterSpacing',
		'textTransform',
		'writingMode',
	];

	return (
		<>
			<ToggleControl
				label={__('Color', 'lazy-blocks')}
				help={__(
					'Additional fields to manage colors in the block.',
					'lazy-blocks'
				)}
				checked={!!supportsColor && supportsColor !== 'false'}
				onChange={(value) => {
					if (value) {
						const defaultColor = {};
						colorOptions.forEach((option) => {
							defaultColor[option] = [
								'background',
								'text',
								'enableContrastChecker',
							].includes(option);
						});
						updateData({ supports_color: defaultColor });
					} else {
						updateData({ supports_color: false });
					}
				}}
				__nextHasNoMarginBottom
			/>
			{supportsColor &&
				supportsColor !== 'false' &&
				typeof supportsColor === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select color options',
								'lazy-blocks'
							)}
							options={createSelectOptions(colorOptions)}
							value={objectToSelectValues(supportsColor)}
							onChange={(value) =>
								updateObjectSupports(
									colorOptions,
									value,
									updateData,
									'supports_color'
								)
							}
						/>
					</BaseControl>
				)}
			<ToggleControl
				label={__('Typography', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block typography.',
					'lazy-blocks'
				)}
				checked={!!supportsTypography && supportsTypography !== 'false'}
				onChange={(value) => {
					if (value) {
						const defaultTypography = {};
						typographyOptions.forEach((option) => {
							defaultTypography[option] = [
								'fontSize',
								'lineHeight',
								'textAlign',
							].includes(option);
						});
						updateData({ supports_typography: defaultTypography });
					} else {
						updateData({ supports_typography: false });
					}
				}}
				__nextHasNoMarginBottom
			/>
			{supportsTypography &&
				supportsTypography !== 'false' &&
				typeof supportsTypography === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select typography options',
								'lazy-blocks'
							)}
							options={createSelectOptions(typographyOptions)}
							value={objectToSelectValues(supportsTypography)}
							onChange={(value) =>
								updateObjectSupports(
									typographyOptions,
									value,
									updateData,
									'supports_typography'
								)
							}
						/>
					</BaseControl>
				)}
			<ToggleControl
				label={__('Spacing', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block spacings.',
					'lazy-blocks'
				)}
				checked={!!supportsSpacing && supportsSpacing !== 'false'}
				onChange={(value) => {
					if (value) {
						const defaultSpacing = {};
						spacingOptions.forEach((option) => {
							defaultSpacing[option] = [
								'margin',
								'padding',
							].includes(option);
						});
						updateData({ supports_spacing: defaultSpacing });
					} else {
						updateData({ supports_spacing: false });
					}
				}}
				__nextHasNoMarginBottom
			/>
			{supportsSpacing &&
				supportsSpacing !== 'false' &&
				typeof supportsSpacing === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select spacing options',
								'lazy-blocks'
							)}
							options={createSelectOptions(spacingOptions)}
							value={objectToSelectValues(supportsSpacing)}
							onChange={(value) =>
								updateObjectSupports(
									spacingOptions,
									value,
									updateData,
									'supports_spacing'
								)
							}
						/>
					</BaseControl>
				)}
			<ToggleControl
				label={__('Dimensions', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block dimensions.',
					'lazy-blocks'
				)}
				checked={!!supportsDimensions && supportsDimensions !== 'false'}
				onChange={(value) => {
					if (value) {
						const defaultDimensions = {};
						dimensionsOptions.forEach((option) => {
							defaultDimensions[option] = [
								'aspectRatio',
								'minHeight',
							].includes(option);
						});
						updateData({ supports_dimensions: defaultDimensions });
					} else {
						updateData({ supports_dimensions: false });
					}
				}}
				__nextHasNoMarginBottom
			/>
			{supportsDimensions &&
				supportsDimensions !== 'false' &&
				typeof supportsDimensions === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select dimensions options',
								'lazy-blocks'
							)}
							options={createSelectOptions(dimensionsOptions)}
							value={objectToSelectValues(supportsDimensions)}
							onChange={(value) =>
								updateObjectSupports(
									dimensionsOptions,
									value,
									updateData,
									'supports_dimensions'
								)
							}
						/>
					</BaseControl>
				)}
			<ToggleControl
				label={__('Shadow', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block shadow.',
					'lazy-blocks'
				)}
				checked={supportsShadow}
				onChange={(value) => updateData({ supports_shadow: value })}
			/>
			<ToggleControl
				label={__('Layout', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block layout.',
					'lazy-blocks'
				)}
				checked={!!supportsLayout && supportsLayout !== 'false'}
				onChange={(value) => {
					if (value) {
						const defaultLayout = {};
						layoutOptions.forEach((option) => {
							defaultLayout[option] = [
								'allowEditing',
								'allowInheriting',
								'allowVerticalAlignment',
								'allowJustification',
								'allowOrientation',
								'allowCustomContentAndWideSize',
							].includes(option);
						});
						updateData({ supports_layout: defaultLayout });
					} else {
						updateData({ supports_layout: false });
					}
				}}
				__nextHasNoMarginBottom
			/>
			{supportsLayout &&
				supportsLayout !== 'false' &&
				typeof supportsLayout === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select layout options',
								'lazy-blocks'
							)}
							options={createSelectOptions(layoutOptions)}
							value={objectToSelectValues(supportsLayout)}
							onChange={(value) =>
								updateObjectSupports(
									layoutOptions,
									value,
									updateData,
									'supports_layout'
								)
							}
						/>
					</BaseControl>
				)}
			<BaseControl
				id="lazyblocks-supports-align"
				label={__('Align', 'lazy-blocks')}
			>
				<Select
					id="lazyblocks-supports-align"
					isMulti
					placeholder={__('Select align options', 'lazy-blocks')}
					options={createSelectOptions([
						'wide',
						'full',
						'left',
						'center',
						'right',
					])}
					value={arrayToSelectValues(
						supportsAlign && supportsAlign.length
							? supportsAlign.filter((val) => val !== 'none')
							: []
					)}
					onChange={(value) => {
						if (value && value.length > 0) {
							const result = value.map(
								(optionData) => optionData.value
							);

							updateData({ supports_align: result });
						} else {
							updateData({ supports_align: ['none'] });
						}
					}}
				/>
			</BaseControl>
			<ToggleControl
				label={__('Anchor', 'lazy-blocks')}
				help={__(
					'Additional field to add block ID attribute.',
					'lazy-blocks'
				)}
				checked={supportsAnchor}
				onChange={(value) => updateData({ supports_anchor: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Class Name', 'lazy-blocks')}
				help={__(
					'Additional field to add custom class name.',
					'lazy-blocks'
				)}
				checked={supportsClassname}
				onChange={(value) => updateData({ supports_classname: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Multiple', 'lazy-blocks')}
				help={__(
					'Allow use block multiple times on the page.',
					'lazy-blocks'
				)}
				checked={supportsMultiple}
				onChange={(value) => updateData({ supports_multiple: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Inserter', 'lazy-blocks')}
				help={__('Show block in blocks inserter.', 'lazy-blocks')}
				checked={supportsInserter}
				onChange={(value) => updateData({ supports_inserter: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Reusable', 'lazy-blocks')}
				help={__(
					'Allow converting block into reusable block.',
					'lazy-blocks'
				)}
				checked={supportsReusable}
				onChange={(value) => updateData({ supports_reusable: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Lock', 'lazy-blocks')}
				help={__(
					'Allow block locking/unlocking by a user.',
					'lazy-blocks'
				)}
				checked={supportsLock}
				onChange={(value) => updateData({ supports_lock: value })}
				__nextHasNoMarginBottom
			/>
		</>
	);
}
