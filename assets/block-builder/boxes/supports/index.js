/* eslint-disable indent */
/**
 * WordPress dependencies.
 */

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem,
	BaseControl,
	Notice,
	ToolsPanel as StableToolsPanel,
	ToolsPanelItem as StableToolsPanelItem,
	ToggleControl,
} from '@wordpress/components';
import { Children } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import Select from '../../../components/select';

const ToolsPanel = StableToolsPanel || __experimentalToolsPanel;
const ToolsPanelItem = StableToolsPanelItem || __experimentalToolsPanelItem;

// Same defaults as the block meta in classes/class-blocks.php.
const SUPPORTS_DEFAULTS = {
	supports_color: false,
	supports_typography: false,
	supports_spacing: false,
	supports_dimensions: false,
	supports_border: false,
	supports_background: false,
	supports_shadow: false,
	supports_filter: false,
	supports_position: false,
	supports_layout: false,
	supports_align: ['wide', 'full'],
	supports_anchor: false,
	supports_classname: true,
	supports_multiple: true,
	supports_inserter: true,
	supports_reusable: true,
	supports_lock: true,
	supports_interactivity: false,
};

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

/**
 * Sorts tools panel items by label, so the panel and its menu list them A-Z.
 *
 * @param {Array} items ToolsPanelItem elements.
 *
 * @return {Array} Sorted elements.
 */
export function sortByLabel(items) {
	return Children.toArray(items).sort((a, b) =>
		a.props.label.localeCompare(b.props.label)
	);
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

	function hasValue(key) {
		const value = data[key];
		const defaultValue = SUPPORTS_DEFAULTS[key];

		if (Array.isArray(defaultValue)) {
			const sorted = (list) => JSON.stringify([...list].sort());

			return (
				sorted(Array.isArray(value) ? value : []) !==
				sorted(defaultValue)
			);
		}

		return isSupportEnabled(value) !== isSupportEnabled(defaultValue);
	}

	function resetSupport(key) {
		updateData({ [key]: SUPPORTS_DEFAULTS[key] });
	}

	return (
		<ToolsPanel
			className="lzb-block-builder-supports"
			label={__('Supports', 'lazy-blocks')}
			resetAll={() => updateData({ ...SUPPORTS_DEFAULTS })}
		>
			{showWrapperHint ? (
				<div className="lzb-block-builder-supports-hint">
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
				</div>
			) : null}
			{sortByLabel([
				<ToolsPanelItem
					label={__('Color', 'lazy-blocks')}
					hasValue={() => hasValue('supports_color')}
					onDeselect={() => resetSupport('supports_color')}
				>
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Typography', 'lazy-blocks')}
					hasValue={() => hasValue('supports_typography')}
					onDeselect={() => resetSupport('supports_typography')}
				>
					<ToggleControl
						label={__('Typography', 'lazy-blocks')}
						help={__(
							'Additional fields to manage block typography.',
							'lazy-blocks'
						)}
						checked={
							!!supportsTypography &&
							supportsTypography !== 'false'
						}
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
								updateData({
									supports_typography: defaultTypography,
								});
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
									options={createSelectOptions(
										typographyOptions
									)}
									value={objectToSelectValues(
										supportsTypography
									)}
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Spacing', 'lazy-blocks')}
					hasValue={() => hasValue('supports_spacing')}
					onDeselect={() => resetSupport('supports_spacing')}
				>
					<ToggleControl
						label={__('Spacing', 'lazy-blocks')}
						help={__(
							'Additional fields to manage block spacings.',
							'lazy-blocks'
						)}
						checked={
							!!supportsSpacing && supportsSpacing !== 'false'
						}
						onChange={(value) => {
							if (value) {
								const defaultSpacing = {};
								spacingOptions.forEach((option) => {
									defaultSpacing[option] = [
										'margin',
										'padding',
									].includes(option);
								});
								updateData({
									supports_spacing: defaultSpacing,
								});
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
									options={createSelectOptions(
										spacingOptions
									)}
									value={objectToSelectValues(
										supportsSpacing
									)}
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Dimensions', 'lazy-blocks')}
					hasValue={() => hasValue('supports_dimensions')}
					onDeselect={() => resetSupport('supports_dimensions')}
				>
					<ToggleControl
						label={__('Dimensions', 'lazy-blocks')}
						help={__(
							'Additional fields to manage block dimensions.',
							'lazy-blocks'
						)}
						checked={
							!!supportsDimensions &&
							supportsDimensions !== 'false'
						}
						onChange={(value) => {
							if (value) {
								const defaultDimensions = {};
								dimensionsOptions.forEach((option) => {
									defaultDimensions[option] = [
										'aspectRatio',
										'minHeight',
									].includes(option);
								});
								updateData({
									supports_dimensions: defaultDimensions,
								});
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
									options={createSelectOptions(
										dimensionsOptions
									)}
									value={objectToSelectValues(
										supportsDimensions
									)}
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Border', 'lazy-blocks')}
					hasValue={() => hasValue('supports_border')}
					onDeselect={() => resetSupport('supports_border')}
				>
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Background', 'lazy-blocks')}
					hasValue={() => hasValue('supports_background')}
					onDeselect={() => resetSupport('supports_background')}
				>
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
								updateData({
									supports_background: defaultValue,
								});
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
									options={createSelectOptions(
										backgroundOptions
									)}
									value={objectToSelectValues(
										supportsBackground
									)}
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Shadow', 'lazy-blocks')}
					hasValue={() => hasValue('supports_shadow')}
					onDeselect={() => resetSupport('supports_shadow')}
				>
					<ToggleControl
						label={__('Shadow', 'lazy-blocks')}
						help={__(
							'Additional fields to manage block shadow.',
							'lazy-blocks'
						)}
						checked={supportsShadow}
						onChange={(value) =>
							updateData({ supports_shadow: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Duotone', 'lazy-blocks')}
					hasValue={() => hasValue('supports_filter')}
					onDeselect={() => resetSupport('supports_filter')}
				>
					<ToggleControl
						label={__('Duotone', 'lazy-blocks')}
						help={__(
							'Additional field to apply a duotone filter to the block.',
							'lazy-blocks'
						)}
						checked={isSupportEnabled(supportsFilter)}
						onChange={(value) =>
							updateData({
								supports_filter: value
									? { duotone: true }
									: false,
							})
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Sticky Position', 'lazy-blocks')}
					hasValue={() => hasValue('supports_position')}
					onDeselect={() => resetSupport('supports_position')}
				>
					<ToggleControl
						label={__('Sticky Position', 'lazy-blocks')}
						help={__(
							'Additional field to make the block sticky.',
							'lazy-blocks'
						)}
						checked={isSupportEnabled(supportsPosition)}
						onChange={(value) =>
							updateData({
								supports_position: value
									? { sticky: true }
									: false,
							})
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Layout', 'lazy-blocks')}
					hasValue={() => hasValue('supports_layout')}
					onDeselect={() => resetSupport('supports_layout')}
				>
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Align', 'lazy-blocks')}
					hasValue={() => hasValue('supports_align')}
					onDeselect={() => resetSupport('supports_align')}
				>
					<BaseControl
						id="lazyblocks-supports-align"
						label={__('Align', 'lazy-blocks')}
					>
						<Select
							id="lazyblocks-supports-align"
							isMulti
							placeholder={__(
								'Select align options',
								'lazy-blocks'
							)}
							options={createSelectOptions([
								'wide',
								'full',
								'left',
								'center',
								'right',
							])}
							value={arrayToSelectValues(
								supportsAlign && supportsAlign.length
									? supportsAlign.filter(
											(val) => val !== 'none'
										)
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
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Anchor', 'lazy-blocks')}
					hasValue={() => hasValue('supports_anchor')}
					onDeselect={() => resetSupport('supports_anchor')}
				>
					<ToggleControl
						label={__('Anchor', 'lazy-blocks')}
						help={__(
							'Additional field to add block ID attribute.',
							'lazy-blocks'
						)}
						checked={supportsAnchor}
						onChange={(value) =>
							updateData({ supports_anchor: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Class Name', 'lazy-blocks')}
					hasValue={() => hasValue('supports_classname')}
					onDeselect={() => resetSupport('supports_classname')}
				>
					<ToggleControl
						label={__('Class Name', 'lazy-blocks')}
						help={__(
							'Additional field to add custom class name.',
							'lazy-blocks'
						)}
						checked={supportsClassname}
						onChange={(value) =>
							updateData({ supports_classname: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Multiple', 'lazy-blocks')}
					hasValue={() => hasValue('supports_multiple')}
					onDeselect={() => resetSupport('supports_multiple')}
				>
					<ToggleControl
						label={__('Multiple', 'lazy-blocks')}
						help={__(
							'Allow use block multiple times on the page.',
							'lazy-blocks'
						)}
						checked={supportsMultiple}
						onChange={(value) =>
							updateData({ supports_multiple: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Inserter', 'lazy-blocks')}
					hasValue={() => hasValue('supports_inserter')}
					onDeselect={() => resetSupport('supports_inserter')}
				>
					<ToggleControl
						label={__('Inserter', 'lazy-blocks')}
						help={__(
							'Show block in blocks inserter.',
							'lazy-blocks'
						)}
						checked={supportsInserter}
						onChange={(value) =>
							updateData({ supports_inserter: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Reusable', 'lazy-blocks')}
					hasValue={() => hasValue('supports_reusable')}
					onDeselect={() => resetSupport('supports_reusable')}
				>
					<ToggleControl
						label={__('Reusable', 'lazy-blocks')}
						help={__(
							'Allow converting block into reusable block.',
							'lazy-blocks'
						)}
						checked={supportsReusable}
						onChange={(value) =>
							updateData({ supports_reusable: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Lock', 'lazy-blocks')}
					hasValue={() => hasValue('supports_lock')}
					onDeselect={() => resetSupport('supports_lock')}
				>
					<ToggleControl
						label={__('Lock', 'lazy-blocks')}
						help={__(
							'Allow block locking/unlocking by a user.',
							'lazy-blocks'
						)}
						checked={supportsLock}
						onChange={(value) =>
							updateData({ supports_lock: value })
						}
					/>
				</ToolsPanelItem>,
				<ToolsPanelItem
					label={__('Interactivity', 'lazy-blocks')}
					hasValue={() => hasValue('supports_interactivity')}
					onDeselect={() => resetSupport('supports_interactivity')}
				>
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
				</ToolsPanelItem>,
			])}
		</ToolsPanel>
	);
}
