/**
 * WordPress dependencies
 */
/**
 * Internal dependencies
 */
import * as selectors from './selectors';

const { registerStore } = wp.data;

registerStore('lazy-blocks/utils', {
  selectors,
  reducer(state) {
    return state;
  },
});
