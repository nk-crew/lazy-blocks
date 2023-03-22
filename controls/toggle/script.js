import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

const { __ } = wp.i18n;

const { Fragment } = wp.element;

const { addFilter } = wp.hooks;

const { PanelBody, TextControl, ToggleControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.toggle.render', 'lzb.editor', (render, props) => (
  <BaseControl {...useBlockControlProps(props)}>
    <ToggleControl
      label={props.data.alongside_text}
      checked={!!props.getValue()}
      onChange={props.onChange}
    />
  </BaseControl>
));

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.toggle.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <Fragment>
      <PanelBody>
        <TextControl
          label={__('Alongside Text', 'lazy-blocks')}
          help={__('Displays text alongside the toggle', 'lazy-blocks')}
          value={data.alongside_text}
          onChange={(value) => updateData({ alongside_text: value })}
        />
      </PanelBody>
      <PanelBody>
        <BaseControl label={__('Checked', 'lazy-blocks')}>
          <ToggleControl
            label={__('Yes', 'lazy-blocks')}
            checked={data.checked === 'true'}
            onChange={(value) => updateData({ checked: value ? 'true' : 'false' })}
          />
        </BaseControl>
      </PanelBody>
    </Fragment>
  );
});
