import ImageControl from './image-control';

const {
    addFilter,
} = wp.hooks;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.image.render', 'lzb.editor', ( render, props ) => (
    <ImageControl
        label={ props.data.label }
        help={ props.data.help }
        value={ props.getValue() }
        onChange={ ( val ) => {
            const result = val ? {
                alt: val.alt || '',
                title: val.title || '',
                caption: val.caption || '',
                id: val.id || '',
                link: val.link || '',
                url: val.url || '',
            } : '';

            props.onChange( result );
        } }
    />
) );

/**
 * getValue filter in editor.
 */
addFilter( 'lzb.editor.control.image.getValue', 'lzb.editor', ( value ) => {
    // change string value to array.
    if ( 'string' === typeof value ) {
        try {
            value = JSON.parse( decodeURI( value ) );
        } catch ( e ) {
            value = [];
        }
    }

    return value;
} );

/**
 * updateValue filter in editor.
 */
addFilter( 'lzb.editor.control.image.updateValue', 'lzb.editor', ( value ) => {
    // change array value to string.
    if ( 'object' === typeof value || Array.isArray( value ) ) {
        value = encodeURI( JSON.stringify( value ) );
    }

    return value;
} );
