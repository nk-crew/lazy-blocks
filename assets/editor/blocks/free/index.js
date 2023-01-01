import BlockEdit from './edit';
import BlockSave from './save';

const { __ } = wp.i18n;

const { registerBlockType } = wp.blocks;

// register block.
registerBlockType('lazyblock-core/free', {
  apiVersion: 2,
  title: __('Free Content', 'lazy-blocks'),
  description: __(
    'Block used for adding blocks inside it in cases when template locked from adding blocks.',
    'lazy-blocks'
  ),
  category: 'lazyblocks',
  supports: {
    html: true,
    customClassName: false,
    inserter: window.pagenow && window.pagenow === 'lazyblocks_templates',
  },
  edit: BlockEdit,
  save: BlockSave,
});
