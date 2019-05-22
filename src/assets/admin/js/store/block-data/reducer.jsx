
function reducer( state = false, action ) {
    switch ( action.type ) {
    case 'SET_BLOCK_DATA':
        if ( action.data && action.post_id ) {
            if ( state ) {
                return {
                    ...state,
                    [ action.post_id ]: action.data,
                };
            }
            return {
                [ action.post_id ]: action.data,
            };
        }

        break;
    case 'UPDATE_BLOCK_DATA':
        if ( action.data && action.post_id && state && state[ action.post_id ] ) {
            return {
                ...state,
                [ action.post_id ]: {
                    ...state[ action.post_id ],
                    ...action.data,
                },
            };
        }

        break;
    // no default
    }

    return state;
}

export default reducer;
