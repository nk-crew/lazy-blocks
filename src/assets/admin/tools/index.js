/**
 * Tools Page
 */

/**
 * Internal dependencies
 */
import Tools from './tools';

window.addEventListener('load', () => {
  wp.element.render(<Tools />, document.querySelector('.lazyblocks-tools-page'));
});
