import BaseControl from '../../assets/components/base-control';

import ColorControl from './color-control';

const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { Fragment } = wp.element;

const { PanelBody, ToggleControl, RadioControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.color.render', 'lzb.editor', (render, props) => (
  <BaseControl label={props.data.label} help={props.data.help}>
    <ColorControl
      alpha={props.data.alpha === 'true'}
      value={props.getValue()}
      onChange={props.onChange}
    />
  </BaseControl>
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
          label={__('Alpha Channel', 'lazy-blocks')}
          help={__(
            'Will be added option that allow you to set semi-transparent colors with rgba',
            'lazy-blocks'
          )}
        >
          <ToggleControl
            label={__('Yes', 'lazy-blocks')}
            checked={data.alpha === 'true'}
            onChange={(value) => updateData({ alpha: value ? 'true' : 'false' })}
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
                label: __('Color', 'lazy-blocks'),
                value: '',
              },
              {
                label: __('Array (Color + Slug)', 'lazy-blocks'),
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
