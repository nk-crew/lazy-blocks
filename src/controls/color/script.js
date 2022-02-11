import ColorControl from './color-control';

const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { Fragment } = wp.element;

const { PanelBody, BaseControl, ToggleControl, RadioControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.color.render', 'lzb.editor', (render, props) => (
  <ColorControl
    label={props.data.label}
    help={props.data.help}
    alpha={props.data.alpha === 'true'}
    value={props.getValue()}
    onChange={props.onChange}
  />
));

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.color.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <Fragment>
      <PanelBody>
        <BaseControl
          label={__('Alpha Channel', '@@text_domain')}
          help={__(
            'Will be added option that allow you to set semi-transparent colors with rgba',
            '@@text_domain'
          )}
        >
          <ToggleControl
            label={__('Yes', '@@text_domain')}
            checked={data.alpha === 'true'}
            onChange={(value) => updateData({ alpha: value ? 'true' : 'false' })}
          />
        </BaseControl>
      </PanelBody>
      <PanelBody>
        <BaseControl
          label={__('Output Format', '@@text_domain')}
          help={__('Allows you to change attribute output format', '@@text_domain')}
        >
          <RadioControl
            options={[
              {
                label: __('Color', '@@text_domain'),
                value: '',
              },
              {
                label: __('Array (Color + Slug)', '@@text_domain'),
                value: 'array',
              },
            ]}
            selected={data.output_format || ''}
            onChange={(value) => updateData({ output_format: value })}
          />
        </BaseControl>
      </PanelBody>
    </Fragment>
  );
});
