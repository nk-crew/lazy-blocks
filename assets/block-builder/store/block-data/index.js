/**
 * WordPress dependencies.
 */
import { createReduxStore, register } from '@wordpress/data';
import * as actions from './actions';
import * as controls from './controls';
/**
 * Internal dependencies.
 */
import reducer from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

const store = createReduxStore('lazy-blocks/block-data', {
	reducer,
	selectors,
	actions,
	controls,
	resolvers,
});

register(store);
