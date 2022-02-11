const { addFilter } = wp.hooks;

const { BaseControl } = wp.components;

const { InnerBlocks } = wp.blockEditor;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.inner_blocks.render', 'lzb.editor', (render, props) => (
  <BaseControl key={props.data.name} label={props.data.label}>
    <InnerBlocks />
  </BaseControl>
));
