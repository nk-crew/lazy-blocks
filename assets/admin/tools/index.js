/**
 * Styles.
 */
import './index.scss';

/**
 * WordPress dependencies.
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Tools from './tools';

window.addEventListener('load', () => {
	render(<Tools />, document.querySelector('.lazyblocks-tools-page'));
});
