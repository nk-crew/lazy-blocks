/* eslint-disable no-param-reassign */
import ComponentChoices from '../select/component-choices';

const { __ } = wp.i18n;

const { Fragment } = wp.element;

const { addFilter } = wp.hooks;

const { PanelBody, BaseControl, RadioControl, ToggleControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.radio.render', 'lzb.editor', (render, props) => (
  <RadioControl
    label={props.data.label}
    help={props.data.help}
    selected={props.getValue()}
    options={props.data.choices}
    onChange={props.onChange}
  />
));

/**
 * Control value valid in editor.
 */
addFilter('lzb.editor.control.radio.isValueValid', 'lzb.editor', (isValid, value, data) => {
  if (data.allow_null === 'true') {
    isValid = true;
  }

  return isValid;
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.radio.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <Fragment>
      <PanelBody>
        <ComponentChoices {...props} />
      </PanelBody>
      <PanelBody>
        <BaseControl
          label={__('Allow Null', '@@text_domain')}
          help={__('Allows you to reset selected option value to null', '@@text_domain')}
        >
          <ToggleControl
            label={__('Yes', '@@text_domain')}
            checked={data.allow_null === 'true'}
            onChange={(value) => updateData({ allow_null: value ? 'true' : 'false' })}
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
                label: __('Value', '@@text_domain'),
                value: '',
              },
              {
                label: __('Label', '@@text_domain'),
                value: 'label',
              },
              {
                label: __('Both (Array)', '@@text_domain'),
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
