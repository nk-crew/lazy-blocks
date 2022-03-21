/* eslint-disable react/jsx-wrap-multilines */
import ColorPalette from './color-palette-control';

const { Fragment } = wp.element;

const { BaseControl, ColorIndicator } = wp.components;

const { useSelect } = wp.data;

function ColorControl(props) {
  const { label, value, help, alpha = false, onChange = () => {} } = props;

  const { colors } = useSelect((select) => {
    const settings = select('core/block-editor').getSettings();
    const result = props.colors === undefined ? settings.colors : props.colors;

    return {
      colors: result,
    };
  });

  return (
    <BaseControl
      label={
        <Fragment>
          {label}
          <ColorIndicator colorValue={value} />
        </Fragment>
      }
      help={help}
      className="lzb-gutenberg-color"
    >
      <ColorPalette
        colors={colors}
        value={value}
        disableAlpha={!alpha}
        onChange={(val) => {
          onChange(val);
        }}
      />
    </BaseControl>
  );
}

export default ColorControl;
