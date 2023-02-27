const { useSelect } = wp.data;
const { InnerBlocks, useBlockProps, useInnerBlocksProps } = wp.blockEditor;

export default function BlockEdit({ clientId }) {
  const { hasChildBlocks } = useSelect(
    (select) => {
      const { getBlockOrder } = select('core/block-editor');

      return {
        hasChildBlocks: getBlockOrder(clientId).length > 0,
      };
    },
    [clientId]
  );

  const blockProps = useBlockProps({ className: 'lazyblocks-free' });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    templateLock: null,
    renderAppender: hasChildBlocks ? undefined : InnerBlocks.ButtonBlockAppender,
  });

  return <div {...innerBlocksProps} />;
}
