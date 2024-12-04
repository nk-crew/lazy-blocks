/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, Notice, Button } from '@wordpress/components';

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
	const innerBlocksProps = useInnerBlocksProps({
		className: 'lazyblock-inner-blocks',
	});

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

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.inner_blocks.settings',
	'lzb.constructor',
	() => {
		return (
			<>
				<PanelBody>
					<Notice
						status="error"
						isDismissible={false}
						className="lzb-block-builder-notice"
					>
						<p>
							{__(
								'The Inner Blocks control deprecated since v3.4.0, you should migrate to the <InnerBlocks /> component as this control will be removed in future plugin updates.',
								'lazy-blocks'
							)}
						</p>
						<Button
							href="https://www.lazyblocks.com/docs/blocks-controls/inner-blocks/"
							target="_blank"
							variant="primary"
						>
							{__('Read More', 'lazy-blocks')}
						</Button>
					</Notice>
				</PanelBody>
			</>
		);
	}
);
