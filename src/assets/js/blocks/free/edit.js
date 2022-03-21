const { InnerBlocks } = wp.blockEditor;

export default function BlockEdit() {
  return (
    <div className="lazyblocks-free">
      <InnerBlocks templateLock={null} />
    </div>
  );
}
