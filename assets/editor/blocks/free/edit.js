const { useBlockProps, useInnerBlocksProps } = wp.blockEditor;

export default function BlockEdit() {
  const props = useBlockProps({ className: 'lazyblocks-free' });
  const innerBlockProps = useInnerBlocksProps(props, { templateLock: null });

  return <div {...innerBlockProps} />;
}
