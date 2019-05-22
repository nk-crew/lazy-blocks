import * as actions from './actions';

export function * getBlockData( id ) {
    const query = `/lazy-blocks/v1/get-block-data/?post_id=${ id }`;
    const data = yield actions.apiFetch( { path: query } );

    return actions.setBlockData( id, data );
}
