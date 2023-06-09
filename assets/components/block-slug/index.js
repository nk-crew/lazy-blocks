/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { BaseControl, TextControl } from '@wordpress/components';

export default function BlockSlug(props) {
	return (
		<BaseControl id={props.label} label={props.label || ''}>
			<div className="lazyblocks-component-block-slug">
				<div className="lazyblocks-component-block-slug-prefix">
					lazyblock/
				</div>
				<TextControl
					{...{
						...props,
						...{ label: '' },
					}}
				/>
			</div>
		</BaseControl>
	);
}
