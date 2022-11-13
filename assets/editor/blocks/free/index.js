import BlockEdit from './edit';
import BlockSave from './save';

const { __ } = wp.i18n;

const { registerBlockType } = wp.blocks;

// register block.
registerBlockType('lazyblock-core/free', {
  title: __('Free Content', 'lazy-blocks'),
  description: __(
    'Block used for adding blocks inside it in cases when template locked from adding blocks.',
    'lazy-blocks'
  ),
  category: 'lazyblocks',
  supports: {
    html: true,
    inserter: window.pagenow && 'lazyblocks_templates' === window.pagenow,
  },
  edit: BlockEdit,
  save: BlockSave,
});