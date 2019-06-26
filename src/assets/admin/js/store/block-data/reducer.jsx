import getUID from '../../utils/get-uid';
import controlsDefaults from '../../blocks/selected-control-settings/defaults';

const {
    omit,
} = window.lodash;

function reducer( state = { data: false }, action ) {
    switch ( action.type ) {
    case 'SET_BLOCK_DATA':
        if ( action.data ) {
            if ( state ) {
                return {
                    ...state,
                    ...{
                        data: action.data,
                    },
                };
            }
            return action;
        }

        break;
    case 'UPDATE_BLOCK_DATA':
        if ( action.data && state ) {
            return {
                ...state,
                ...{
                    data: {
                        ...state.data,
                        ...action.data,
                    },
                },
            };
        }

        break;
    case 'UPDATE_CONTROL_DATA':
        if (
            action.id &&
            action.data &&
            state.data &&
            state.data.controls &&
            state.data.controls[ action.id ]
        ) {
            return {
                ...state,
                ...{
                    data: {
                        ...state.data,
                        controls: {
                            ...state.data.controls,
                            ...{ [ action.id ]: {
                                ...state.data.controls[ action.id ],
                                ...action.data,
                            } },
                        },
                    },
                },
            };
        }

        break;
    case 'ADD_CONTROL':
        if ( action.data && state.data ) {
            const {
                controls = {},
            } = state.data;

            let newId = getUID();
            while ( typeof controls[ `control_${ newId }` ] !== 'undefined' ) {
                newId = getUID();
            }
            newId = `control_${ newId }`;

            return {
                ...state,
                ...{
                    data: {
                        ...state.data,
                        controls: {
                            ...state.data.controls,
                            [ newId ]: {
                                ...controlsDefaults,
                                ...action.data,
                            },
                        },
                    },
                },
                selectedControlId: newId,
            };
        }

        break;
    case 'REMOVE_CONTROL':
        if ( action.id && state.data ) {
            if ( state.data.controls && state.data.controls[ action.id ] ) {
                delete state.data.controls[ action.id ];

                return {
                    ...state,
                    ...{
                        data: omit( state.data, [ action.id ] ),
                    },
                };
            }
        }

        break;
    case 'RESORT_CONTROL':
        if (
            action.id &&
            action.newId &&
            action.id !== action.newId &&
            state.data &&
            state.data.controls
        ) {
            const newControls = {};
            let insertBefore = true;

            Object.keys( state.data.controls ).forEach( ( key ) => {
                if ( key !== action.id ) {
                    if ( insertBefore && key === action.newId ) {
                        newControls[ action.id ] = state.data.controls[ action.id ];
                    }

                    newControls[ key ] = state.data.controls[ key ];

                    if ( ! insertBefore && key === action.newId ) {
                        newControls[ action.id ] = state.data.controls[ action.id ];
                    }
                } else {
                    insertBefore = false;
                }
            } );

            state.data.controls = newControls;

            return {
                ...state,
                ...{
                    data: {
                        ...state.data,
                        controls: newControls,
                    },
                },
            };
        }

        break;
    case 'SELECT_CONTROL':
        if ( action.id ) {
            return {
                ...state,
                selectedControlId: action.id,
            };
        }

        break;
    case 'CLEAR_SELECTED_CONTROL':
        if ( state.selectedControlId ) {
            return {
                ...state,
                selectedControlId: null,
            };
        }

        break;
    // no default
    }

    return state;
}

export default reducer;
