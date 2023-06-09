/**
 * WordPress dependencies.
 */
import { addFilter } from '@wordpress/hooks';
import { useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';

/**
 * Control render in editor.
 *
 * @param {Object} props - component props.
 *
 * @return {JSX} - component render.
 */
function ComponentRender(props) {
	const { data } = props;
	const innerBlocksProps = useInnerBlocksProps();

	let result = <div {...innerBlocksProps} />;

	// Show label in BaseControl if needed.
	if (data.label) {
		result = (
			<BaseControl id={data.name} key={data.name} label={data.label}>
				{result}
			</BaseControl>
		);
	}

	return result;
}

addFilter(
	'lzb.editor.control.inner_blocks.render',
	'lzb.editor',
	(render, props) => {
		return <ComponentRender {...props} />;
	}
);
