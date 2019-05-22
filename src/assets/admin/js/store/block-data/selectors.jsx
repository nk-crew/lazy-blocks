
export function getBlockData( state, id ) {
    return state[ id ] || {};
}

export function updateBlockData( state, id, data ) {
    state[ id ] = {
        ...state[ id ],
        ...data,
    };

    return state;
}
