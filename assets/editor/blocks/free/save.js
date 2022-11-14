const { useInnerBlocksProps } = wp.blockEditor;

export default function BlockSave() {
  const innerBlocksProps = useInnerBlocksProps.save();
  return innerBlocksProps.children;
}
