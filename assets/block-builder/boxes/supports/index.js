/* eslint-disable indent */
/**
 * WordPress dependencies.
 */

import { BaseControl, Notice, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

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

// Supports that core applies to the block wrapper element.
const STYLE_SUPPORT_KEYS = [
	'supports_color',
	'supports_typography',
	'supports_spacing',
	'supports_dimensions',
	'supports_border',
	'supports_background',
	'supports_shadow',
	'supports_filter',
	'supports_position',
];

// Same marker test as the PHP renderer in classes/class-blocks.php.
function hasUseBlockProps(code) {
	return /<\w+[^>]*\s+useBlockProps[^>]*>/.test(code || '');
}

function isSupportEnabled(value) {
	return !!value && value !== 'false';
}

export default function SupportsSettings(props) {
	const { data, updateData } = props;

	const {
		supports_color: supportsColor,
		supports_typography: supportsTypography,
		supports_spacing: supportsSpacing,
		supports_dimensions: supportsDimensions,
		supports_shadow: supportsShadow,
		supports_border: supportsBorder,
		supports_background: supportsBackground,
		supports_filter: supportsFilter,
		supports_position: supportsPosition,
		supports_interactivity: supportsInteractivity,
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

	const dimensionsOptions = ['aspectRatio', 'minHeight', 'width', 'height'];

	const borderOptions = ['color', 'radius', 'style', 'width'];

	const backgroundOptions = ['backgroundImage', 'backgroundSize'];

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
		'textColumns',
		'textShadow',
	];

	const codeOutputMethod = data.code_output_method || 'html';
	const showWrapperHint =
		codeOutputMethod !== 'template' &&
		!!data.code_frontend_html &&
		!hasUseBlockProps(data.code_frontend_html) &&
		STYLE_SUPPORT_KEYS.some((key) => isSupportEnabled(data[key]));

	return (
		<>
			{showWrapperHint ? (
				<BaseControl>
					<Notice
						status="info"
						isDismissible={false}
						className="lzb-block-builder-notice"
					>
						<p>
							{__(
								'Style supports are applied to the block wrapper. Your frontend code has no element with the useBlockProps attribute, so the styles go to an extra <div> wrapper. Add useBlockProps to your root element to style it directly.',
								'lazy-blocks'
							)}{' '}
							<a
								href="https://www.lazyblocks.com/docs/blocks-code/use-block-props/"
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('Read More', 'lazy-blocks')}
							</a>
						</p>
					</Notice>
				</BaseControl>
			) : null}
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
				label={__('Border', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block border.',
					'lazy-blocks'
				)}
				checked={isSupportEnabled(supportsBorder)}
				onChange={(value) => {
					if (value) {
						const defaultValue = {};
						borderOptions.forEach((option) => {
							defaultValue[option] = true;
						});
						updateData({ supports_border: defaultValue });
					} else {
						updateData({ supports_border: false });
					}
				}}
			/>
			{isSupportEnabled(supportsBorder) &&
				typeof supportsBorder === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select border options',
								'lazy-blocks'
							)}
							options={createSelectOptions(borderOptions)}
							value={objectToSelectValues(supportsBorder)}
							onChange={(value) =>
								updateObjectSupports(
									borderOptions,
									value,
									updateData,
									'supports_border'
								)
							}
						/>
					</BaseControl>
				)}
			<ToggleControl
				label={__('Background', 'lazy-blocks')}
				help={__(
					'Additional fields to manage block background image.',
					'lazy-blocks'
				)}
				checked={isSupportEnabled(supportsBackground)}
				onChange={(value) => {
					if (value) {
						const defaultValue = {};
						backgroundOptions.forEach((option) => {
							defaultValue[option] = true;
						});
						updateData({ supports_background: defaultValue });
					} else {
						updateData({ supports_background: false });
					}
				}}
			/>
			{isSupportEnabled(supportsBackground) &&
				typeof supportsBackground === 'object' && (
					<BaseControl>
						<Select
							isMulti
							placeholder={__(
								'Select background options',
								'lazy-blocks'
							)}
							options={createSelectOptions(backgroundOptions)}
							value={objectToSelectValues(supportsBackground)}
							onChange={(value) =>
								updateObjectSupports(
									backgroundOptions,
									value,
									updateData,
									'supports_background'
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
				label={__('Duotone', 'lazy-blocks')}
				help={__(
					'Additional field to apply a duotone filter to the block.',
					'lazy-blocks'
				)}
				checked={isSupportEnabled(supportsFilter)}
				onChange={(value) =>
					updateData({
						supports_filter: value ? { duotone: true } : false,
					})
				}
			/>
			<ToggleControl
				label={__('Sticky Position', 'lazy-blocks')}
				help={__(
					'Additional field to make the block sticky.',
					'lazy-blocks'
				)}
				checked={isSupportEnabled(supportsPosition)}
				onChange={(value) =>
					updateData({
						supports_position: value ? { sticky: true } : false,
					})
				}
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
			/>
			<ToggleControl
				label={__('Class Name', 'lazy-blocks')}
				help={__(
					'Additional field to add custom class name.',
					'lazy-blocks'
				)}
				checked={supportsClassname}
				onChange={(value) => updateData({ supports_classname: value })}
			/>
			<ToggleControl
				label={__('Multiple', 'lazy-blocks')}
				help={__(
					'Allow use block multiple times on the page.',
					'lazy-blocks'
				)}
				checked={supportsMultiple}
				onChange={(value) => updateData({ supports_multiple: value })}
			/>
			<ToggleControl
				label={__('Inserter', 'lazy-blocks')}
				help={__('Show block in blocks inserter.', 'lazy-blocks')}
				checked={supportsInserter}
				onChange={(value) => updateData({ supports_inserter: value })}
			/>
			<ToggleControl
				label={__('Reusable', 'lazy-blocks')}
				help={__(
					'Allow converting block into reusable block.',
					'lazy-blocks'
				)}
				checked={supportsReusable}
				onChange={(value) => updateData({ supports_reusable: value })}
			/>
			<ToggleControl
				label={__('Lock', 'lazy-blocks')}
				help={__(
					'Allow block locking/unlocking by a user.',
					'lazy-blocks'
				)}
				checked={supportsLock}
				onChange={(value) => updateData({ supports_lock: value })}
			/>
			<ToggleControl
				label={__('Interactivity', 'lazy-blocks')}
				help={__(
					'Process Interactivity API directives in the block output.',
					'lazy-blocks'
				)}
				checked={!!supportsInteractivity}
				onChange={(value) =>
					updateData({ supports_interactivity: value })
				}
			/>
		</>
	);
}
