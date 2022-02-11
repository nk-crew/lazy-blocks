const { __ } = wp.i18n;

const { Fragment } = wp.element;

const { addFilter } = wp.hooks;

const { PanelBody, RangeControl, TextControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.range.render', 'lzb.editor', (render, props) => (
  <RangeControl
    label={props.data.label}
    min={props.data.min}
    max={props.data.max}
    step={props.data.step}
    help={props.data.help}
    value={props.getValue()}
    onChange={(val) => {
      props.onChange(parseFloat(val));
    }}
  />
));

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.range.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <Fragment>
      <PanelBody>
        <TextControl
          label={__('Minimum Value', '@@text_domain')}
          type="number"
          step={data.step}
          value={data.min}
          onChange={(value) => updateData({ min: value })}
        />
      </PanelBody>
      <PanelBody>
        <TextControl
          label={__('Maximum Value', '@@text_domain')}
          type="number"
          step={data.step}
          value={data.max}
          onChange={(value) => updateData({ max: value })}
        />
      </PanelBody>
      <PanelBody>
        <TextControl
          label={__('Step Size', '@@text_domain')}
          type="number"
          value={data.step}
          onChange={(value) => updateData({ step: value })}
        />
      </PanelBody>
    </Fragment>
  );
});
