import * as actions from './actions';

export function* getBlockData() {
  const postId = window.lazyblocksConstructorData.post_id;

  const query = `/lazy-blocks/v1/get-block-data/?post_id=${postId}`;
  const data = yield actions.apiFetch({ path: query });

  return actions.setBlockData(data);
}
