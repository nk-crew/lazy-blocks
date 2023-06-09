/* eslint-disable react-hooks/rules-of-hooks */
/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';
import { __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients } from '@wordpress/blockEditor';
import { ColorPalette } from '@wordpress/components';

function useColors() {
	// New way to get colors and gradients.
	if (
		useMultipleOriginColorsAndGradients &&
		useMultipleOriginColorsAndGradients()
	) {
		return useMultipleOriginColorsAndGradients().colors;
	}

	// Old way.
	const { themeColors } = useSelect((select) => {
		const settings = select('core/block-editor').getSettings();

		return {
			themeColors: settings.colors,
		};
	});

	const colors = [];

	if (themeColors && themeColors.length) {
		colors.push({ name: 'Theme', colors: themeColors });
	}

	return colors;
}

function ColorControl(props) {
	const { value, alpha = false, onChange = () => {} } = props;

	const colors = useColors();

	return (
		<ColorPalette
			colors={colors}
			value={value}
			enableAlpha={alpha}
			onChange={(val) => {
				onChange(val);
			}}
			__experimentalHasMultipleOrigins
			__experimentalIsRenderedInSidebar
		/>
	);
}

export default ColorControl;
