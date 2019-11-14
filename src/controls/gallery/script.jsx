import GalleryControl from './gallery-control';

const {
    addFilter,
} = wp.hooks;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.gallery.render', 'lzb.editor', ( render, props ) => {
    return (
        <GalleryControl
            label={ props.data.label }
            help={ props.data.help }
            value={ props.getValue() }
            onChange={ ( val ) => {
                const result = val.map( ( image ) => {
                    return {
                        alt: image.alt || '',
                        title: image.title || '',
                        caption: image.caption || '',
                        id: image.id || '',
                        link: image.link || '',
                        url: image.url || '',
                    };
                } );

                props.onChange( result );
            } }
        />
    );
} );

/**
 * getValue filter in editor.
 */
addFilter( 'lzb.editor.control.gallery.getValue', 'lzb.editor', ( value ) => {
    // change string value to array.
    if ( typeof value === 'string' ) {
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
addFilter( 'lzb.editor.control.gallery.updateValue', 'lzb.editor', ( value ) => {
    // change array value to string.
    if ( typeof value === 'object' || Array.isArray( value ) ) {
        value = encodeURI( JSON.stringify( value ) );
    }

    return value;
} );
