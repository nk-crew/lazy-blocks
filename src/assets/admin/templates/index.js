/**
 * Templates Page
 */

/**
 * Internal dependencies
 */
import Templates from './templates';

// register core Gutenberg blocks.
if ( wp.blockLibrary && wp.blockLibrary.registerCoreBlocks ) {
    wp.blockLibrary.registerCoreBlocks();
}

window.addEventListener( 'load', () => {
    wp.element.render(
        <Templates />,
        document.querySelector( '.lazyblocks-templates-page' )
    );
} );
