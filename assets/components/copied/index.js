/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

export default function Copied({ children }) {
	return (
		<div className="lazyblocks-component-copied">
			{children || __('Copied!', 'lazy-blocks')}
		</div>
	);
}
