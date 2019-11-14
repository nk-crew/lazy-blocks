const {
    controls = {},
} = window.lazyblocksConstructorData || window.lazyblocksGutenberg;

export default function getControlTypeData( name ) {
    if ( name && controls[ name ] ) {
        return controls[ name ];
    }

    return false;
}
