/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import BlockEdit from './edit';
import BlockSave from './save';

// register block.
registerBlockType('lazyblock-core/free', {
	apiVersion: 3,
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
