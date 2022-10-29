/* eslint-disable react/jsx-wrap-multilines */

const { BaseControl, ColorPalette } = wp.components;

const { __experimentalUseMultipleOriginColorsAndGradients: useMultipleOriginColorsAndGradients } =
  wp.blockEditor;

const { useSelect } = wp.data;

function useColors() {
  // New way to get colors and gradients.
  if (useMultipleOriginColorsAndGradients && useMultipleOriginColorsAndGradients()) {
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
  const { label, value, help, alpha = false, onChange = () => {} } = props;

  const colors = useColors();

  return (
    <BaseControl label={label} help={help} className="lzb-gutenberg-color">
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
    </BaseControl>
  );
}

export default ColorControl;
