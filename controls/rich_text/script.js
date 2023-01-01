import BaseControl from '../../assets/components/base-control';

const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { PanelBody, ToggleControl } = wp.components;

const { RichText } = wp.blockEditor;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.rich_text.render', 'lzb.editor', (render, props) => (
  <BaseControl
    key={props.data.name}
    label={props.data.label}
    help={props.data.help}
    className="lzb-gutenberg-rich-text"
  >
    <RichText
      inlineToolbar
      format="string"
      multiline={props.data.multiline === 'true' ? 'p' : false}
      value={props.getValue()}
      onChange={(val) => {
        props.onChange(val);
      }}
    />
  </BaseControl>
));

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.rich_text.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <ToggleControl
        label={__('Multiline', 'lazy-blocks')}
        checked={data.multiline === 'true'}
        onChange={(value) => updateData({ multiline: value ? 'true' : 'false' })}
      />
    </PanelBody>
  );
});
