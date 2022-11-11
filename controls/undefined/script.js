const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { PanelBody } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.undefined.render', 'lzb.editor', () => {
  return <div>{__('Looks like this control does not exists.', 'lazy-blocks')}</div>;
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.undefined.settings', 'lzb.constructor', () => {
  return <PanelBody>{__('Looks like this control does not exists.', 'lazy-blocks')}</PanelBody>;
});
