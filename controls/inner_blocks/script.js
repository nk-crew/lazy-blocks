import BaseControl from '../../assets/components/base-control';

const { addFilter } = wp.hooks;

const { useInnerBlocksProps } = wp.blockEditor;

/**
 * Control render in editor.
 */
function ComponentRender(props) {
  const { data } = props;
  const innerBlocksProps = useInnerBlocksProps();

  let result = <div {...innerBlocksProps} />;

  // Show label in BaseControl if needed.
  if (data.label) {
    result = (
      <BaseControl key={data.name} label={data.label}>
        {result}
      </BaseControl>
    );
  }

  return result;
}

addFilter('lzb.editor.control.inner_blocks.render', 'lzb.editor', (render, props) => {
  return <ComponentRender {...props} />;
});
