/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockEdit from './edit';
import BlockSave from './save';

/**
 * Constructor block
 */
registerBlockType('lzb-constructor/main', {
	apiVersion: 3,
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
