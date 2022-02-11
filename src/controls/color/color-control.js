/* eslint-disable react/jsx-wrap-multilines */
import ColorPalette from './color-palette-control';

const { Component, Fragment } = wp.element;

const { BaseControl, ColorIndicator } = wp.components;

const { withInstanceId, compose } = wp.compose;

const { withSelect } = wp.data;

class ColorControl extends Component {
  render() {
    const { label, value, help, alpha = false, onChange = () => {}, colors } = this.props;

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
}

export default compose([
  withInstanceId,
  withSelect((select, ownProps) => {
    const settings = select('core/block-editor').getSettings();
    const colors = ownProps.colors === undefined ? settings.colors : ownProps.colors;

    return {
      colors,
    };
  }),
])(ColorControl);
