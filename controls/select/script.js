/* eslint-disable no-param-reassign */
import BaseControl from '../../assets/components/base-control';

import ComponentChoices from './component-choices';

const { __ } = wp.i18n;

const { Fragment } = wp.element;

const { addFilter } = wp.hooks;

const { PanelBody, SelectControl, ToggleControl, RadioControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.select.render', 'lzb.editor', (render, props) => {
  let { choices } = props.data;

  // allow null.
  if (props.data.allow_null && props.data.allow_null === 'true') {
    choices = [
      {
        value: '',
        label: __('-- Select --', 'lazy-blocks'),
      },
      ...choices,
    ];
  }

  return (
    <BaseControl help={props.data.help}>
      <SelectControl
        label={props.data.label}
        options={choices}
        multiple={props.data.multiple === 'true'}
        value={props.getValue()}
        className="lzb-gutenberg-select"
        onChange={(val) => {
          props.onChange(val);
        }}
      />
    </BaseControl>
  );
});

/**
 * Control value valid in editor.
 */
addFilter('lzb.editor.control.select.isValueValid', 'lzb.editor', (isValid, value, data) => {
  if (data.allow_null === 'true') {
    isValid = true;
  }

  return isValid;
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.select.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <Fragment>
      <PanelBody>
        <ComponentChoices {...props} />
      </PanelBody>
      <PanelBody>
        <BaseControl
          label={__('Allow Null', 'lazy-blocks')}
          help={__('Allows you to reset selected option value to null', 'lazy-blocks')}
        >
          <ToggleControl
            label={__('Yes', 'lazy-blocks')}
            checked={data.allow_null === 'true'}
            onChange={(value) => updateData({ allow_null: value ? 'true' : 'false' })}
          />
        </BaseControl>
      </PanelBody>
      <PanelBody>
        <BaseControl
          label={__('Multiple', 'lazy-blocks')}
          help={__('Allows you to select multiple values', 'lazy-blocks')}
        >
          <ToggleControl
            label={__('Yes', 'lazy-blocks')}
            checked={data.multiple === 'true'}
            onChange={(value) => updateData({ multiple: value ? 'true' : 'false' })}
          />
        </BaseControl>
      </PanelBody>
      <PanelBody>
        <BaseControl
          label={__('Output Format', 'lazy-blocks')}
          help={__('Allows you to change attribute output format', 'lazy-blocks')}
        >
          <RadioControl
            options={[
              {
                label: __('Value', 'lazy-blocks'),
                value: '',
              },
              {
                label: __('Label', 'lazy-blocks'),
                value: 'label',
              },
              {
                label: __('Both (Array)', 'lazy-blocks'),
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
