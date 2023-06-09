/**
 * WordPress dependencies.
 */
import { useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';

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
		renderAppender: hasChildBlocks
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	});

	return <div {...innerBlocksProps} />;
}
