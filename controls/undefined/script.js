import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { PanelBody } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.undefined.render', 'lzb.editor', (render, props) => {
  return (
    <BaseControl {...useBlockControlProps(props, { label: false, help: false })}>
      {__('Looks like this control does not exists.', 'lazy-blocks')}
    </BaseControl>
  );
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.undefined.settings', 'lzb.constructor', () => {
  return <PanelBody>{__('Looks like this control does not exists.', 'lazy-blocks')}</PanelBody>;
});
