const { InnerBlocks } = wp.blockEditor;

export default function BlockSave(props) {
  const { lazyBlockData } = props;

  let result = null;

  // Return inner blocks content to use it in PHP render.
  Object.keys(lazyBlockData.controls).forEach((k) => {
    if (lazyBlockData.controls[k].type === 'inner_blocks') {
      result = <InnerBlocks.Content />;
    }
  });

  return result;
}
