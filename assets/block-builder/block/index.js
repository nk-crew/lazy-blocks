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
 * Block Builder
 */
registerBlockType('lzb-block-builder/main', {
	apiVersion: 3,
	title: __('Block Builder', 'lazy-blocks'),
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
