const { __ } = wp.i18n;

const { registerBlockType } = wp.blocks;

const {
    InnerBlocks,
} = wp.blockEditor;

// register block.
registerBlockType( 'lazyblock-core/free', {
    title: __( 'Free Content', '@@text_domain' ),
    description: __( 'Block used for adding blocks inside it in cases when template locked from adding blocks.', '@@text_domain' ),
    category: 'lazyblocks',
    supports: {
        html: true,
        inserter: window.lazyblocksGutenberg && window.lazyblocksGutenberg.post_type && 'lazyblocks_templates' === window.lazyblocksGutenberg.post_type,
    },
    edit() {
        return (
            <div className="lazyblocks-free">
                <InnerBlocks templateLock={ null } />
            </div>
        );
    },
    save() {
        return <InnerBlocks.Content />;
    },
} );
