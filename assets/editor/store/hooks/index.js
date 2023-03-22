/**
 * Internal dependencies
 */
import * as selectors from './selectors';

/**
 * WordPress dependencies
 */
const { registerStore } = wp.data;

registerStore('lazy-blocks/hooks', {
  selectors,
  reducer(state) {
    return state;
  },
});
