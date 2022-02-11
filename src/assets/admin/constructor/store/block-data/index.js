import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';
import * as controls from './controls';
import * as resolvers from './resolvers';

const { registerStore } = wp.data;

registerStore('lazy-blocks/block-data', {
  reducer,
  selectors,
  actions,
  controls,
  resolvers,
});
