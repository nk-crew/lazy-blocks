/**
 * Styles.
 */
import './index.scss';

/**
 * WordPress dependencies.
 */
import { createRoot } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Tools from './tools';

window.addEventListener('load', () => {
	createRoot(document.querySelector('.lazyblocks-tools-page')).render(
		<Tools />
	);
});
