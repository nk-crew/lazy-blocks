/**
 * WordPress dependencies.
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';

export default function BlockSave() {
	const innerBlocksProps = useInnerBlocksProps.save();

	return innerBlocksProps.children;
}
