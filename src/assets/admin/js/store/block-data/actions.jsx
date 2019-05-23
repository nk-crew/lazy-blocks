
export function apiFetch( request ) {
    return {
        type: 'API_FETCH',
        request,
    };
}

export function setBlockData( postId, data ) {
    // check if control is array and change it to object
    // unless value will not be saved.
    // related topic: https://wordpress.org/support/topic/controls-not-saving/
    if ( data.controls && typeof data.controls === 'object' && data.controls.constructor === Array ) {
        data.controls = {};
    }

    return {
        type: 'SET_BLOCK_DATA',
        post_id: postId,
        data,
    };
}

export function updateBlockData( postId, data ) {
    return {
        type: 'UPDATE_BLOCK_DATA',
        post_id: postId,
        data,
    };
}
