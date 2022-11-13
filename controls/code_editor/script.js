import BaseControl from '../../assets/components/base-control';

const { addFilter } = wp.hooks;

const { PlainText } = wp.blockEditor;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.code_editor.render', 'lzb.editor', (render, props) => (
  <BaseControl
    label={props.data.label}
    help={props.data.help}
    className="lzb-gutenberg-code-editor"
  >
    <PlainText
      value={props.getValue()}
      onChange={(val) => {
        props.onChange(val);
      }}
    />
  </BaseControl>
));
