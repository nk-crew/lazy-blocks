import BaseControl from '../../assets/components/base-control';

import TMCE from './tmce';

const { addFilter } = wp.hooks;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.classic_editor.render', 'lzb.editor', (render, props, blockProps) => (
  <BaseControl
    key={props.data.name}
    label={props.data.label}
    help={props.data.help}
    className="lzb-gutenberg-classic-editor"
  >
    <TMCE
      content={props.getValue()}
      onChange={(val) => {
        props.onChange(val);
      }}
      editorId={props.placement + blockProps.clientId + props.uniqueId + (props.childIndex || 0)}
    />
  </BaseControl>
));
