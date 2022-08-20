/**
 * Internal dependencies
 */
import BlockEdit from './edit';
import BlockSave from './save';

/**
 * WordPress dependencies
 */
const { registerBlockType } = wp.blocks;

const { __ } = wp.i18n;

/**
 * Constructor block
 */
registerBlockType('lzb-constructor/main', {
  title: __('Blocks Constructor', 'lazy-blocks'),
  category: 'design',
  supports: {
    html: false,
    className: false,
    customClassName: false,
    anchor: false,
    inserter: false,
  },
  edit: BlockEdit,
  save: BlockSave,
});
