/* eslint-disable no-param-reassign */
/**
 * WordPress dependencies.
 */
import { registerBlockType } from '@wordpress/blocks';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import BlockEdit from './edit';
import BlockSave from './save';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
	options = {
		blocks: [],
		controls: {},
	};
}

// each registered block.
options.blocks.forEach((item) => {
	// conditionally show for specific post type.
	if (item.supports.inserter && item?.condition?.length) {
		let preventInsertion = false;
		item.condition.forEach((val) => {
			if (window.pagenow && val === window.pagenow) {
				preventInsertion = true;
			}
		});
		item.supports.inserter = preventInsertion;
	}

	let registerIcon = '';

	if (item.icon && /^dashicons/.test(item.icon)) {
		registerIcon =
			item.icon.replace(/^dashicons dashicons-/, '') || 'marker';
	} else if (item.icon) {
		// eslint-disable-next-line react/no-danger
		registerIcon = <span dangerouslySetInnerHTML={{ __html: item.icon }} />;
	}

	// Prepare initial block arguments.
	const blockArgs = {
		apiVersion: 3,
		title: item.title || item.slug,
		description: item.description,
		icon: registerIcon,
		category: item.category,
		keywords: item.keywords,
		supports: item.supports,

		lazyblock: true,

		edit(props) {
			return <BlockEdit {...props} lazyBlockData={item} />;
		},

		save: BlockSave,
	};

	// Apply filter to allow modify block arguments.
	const filteredBlockArgs = applyFilters(
		'lzb.registerBlockType.args',
		blockArgs,
		item.slug,
		item
	);

	// register block.
	registerBlockType(item.slug, filteredBlockArgs);
});
