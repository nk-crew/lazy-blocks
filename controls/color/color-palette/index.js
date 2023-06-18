/* eslint-disable react-hooks/rules-of-hooks */
/**
 * WordPress dependencies.
 */
import { ColorPalette as WPColorPalette } from '@wordpress/components';
import { __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

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

export default function ColorPalette(props) {
	const { value, alpha = false, palette = true, onChange = () => {} } = props;

	const colors = useColors();

	return (
		<WPColorPalette
			colors={palette ? colors : undefined}
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
