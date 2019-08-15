/**
 * Tools Page
 */

/**
 * Internal dependencies
 */
import Tools from './tools.jsx';

window.addEventListener( 'load', () => {
    wp.element.render(
        <Tools />,
        document.querySelector( '.lazyblocks-tools-page' )
    );
} );
