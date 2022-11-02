const { __ } = wp.i18n;

const { Fragment } = wp.element;

const { addFilter } = wp.hooks;

const { PanelBody, TextControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.undefined.render', 'lzb.editor', (render, props) => {
  console.log(props);

  return <div>{__('Looks like this control does not exists.', 'lazy-blocks')}</div>;
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.undefined.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  console.log(data);

  return (
    <Fragment>
      <PanelBody>{__('Looks like this control does not exists.', 'lazy-blocks')}</PanelBody>
    </Fragment>
  );
});
