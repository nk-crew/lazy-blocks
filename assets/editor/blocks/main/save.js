const { useInnerBlocksProps } = wp.blockEditor;

export default function BlockSave(props) {
  const { lazyBlockData } = props;

  let result = null;

  // Return inner blocks content to use it in PHP render.
  Object.keys(lazyBlockData.controls).forEach((k) => {
    if ('inner_blocks' === lazyBlockData.controls[k].type) {
      const innerBlocksProps = useInnerBlocksProps.save();
      result = innerBlocksProps.children;
    }
  });

  return result;
}
