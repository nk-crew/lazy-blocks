
export function apiFetch( request ) {
    return {
        type: 'API_FETCH',
        request,
    };
}

export function setBlockData( postId, data ) {
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
