/* eslint-disable react-hooks/rules-of-hooks */
/**
 * WordPress dependencies.
 */

import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUseMultipleOriginColorsAndGradients,
	useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import { ColorPalette as WPColorPalette } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

const useColorsAndGradients =
	useMultipleOriginColorsAndGradients ||
	__experimentalUseMultipleOriginColorsAndGradients;

function useColors() {
	// New way to get colors and gradients.
	if (useColorsAndGradients && useColorsAndGradients()) {
		return useColorsAndGradients().colors;
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
		/>
	);
}
