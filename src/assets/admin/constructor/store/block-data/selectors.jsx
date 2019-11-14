import getControlTypeData from '../../../utils/get-control-type-data';

const {
    cloneDeep,
} = window.lodash;

export function getBlockData( state ) {
    return state.data || {};
}

export function getSelectedControlId( state ) {
    return state.selectedControlId || false;
}

export function getSelectedControl( state ) {
    if ( state.selectedControlId ) {
        const blockData = state.data;

        if ( blockData.controls && blockData.controls[ state.selectedControlId ] ) {
            return {
                ...cloneDeep( getControlTypeData( blockData.controls[ state.selectedControlId ].type ) ),
                ...blockData.controls[ state.selectedControlId ],
            };
        }
    }
    return false;
}
