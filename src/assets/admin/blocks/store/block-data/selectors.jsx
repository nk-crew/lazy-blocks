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
            return blockData.controls[ state.selectedControlId ];
        }
    }
    return false;
}
