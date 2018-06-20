
// External Dependencies.
import classnames from 'classnames/dedupe';

let options = window.lazyblocksGutenberg;
if ( ! options || ! options.blocks || ! options.blocks.length ) {
    options = { blocks: [] };
}

const { __ } = wp.i18n;
const {
    Component,
    Fragment,
} = wp.element;
const {
    PanelBody,
    BaseControl,
    RangeControl,
    PanelColor,
    TextControl,
    TextareaControl,
    Inserter,
    ToggleControl,
    CheckboxControl,
    CodeEditor,

    Button,
    DropZoneProvider,
    DropZone,
    FormFileUpload,
    SelectControl,
} = wp.components;

const {
    InspectorControls,
    ColorPalette,
    MediaPlaceholder,

    MediaUpload,
    editorMediaUpload,
} = wp.editor;

const {
    registerBlockType,
} = wp.blocks;


// each registered block.
options.blocks.forEach(( item ) => {
    class LazyBlock extends Component {
        constructor() {
            super( ...arguments );
            this.onControlChange = this.onControlChange.bind( this );
            this.onSelectImages = this.onSelectImages.bind( this );
            this.onSelectImage = this.onSelectImage.bind( this );
            this.renderControls = this.renderControls.bind( this );
        }

        onControlChange( val, control ) {
            const {
                setAttributes,
            } = this.props;

            let result = {};
            result[ control.name ] = val;

            // when enable save in meta we only may save in string, number, boolean and integer types.
            if ( ( typeof val === 'object' || Array.isArray( val ) ) && 'true' === control.save_in_meta && control.save_in_meta_name ) {
                result[ control.name ] = encodeURI( JSON.stringify( result[ control.name ] ) );
            }

            setAttributes(result);
        }

        onSelectImages( images, control ) {
            let result = images.map( ( image ) => {
                return {
                    alt: image.alt || '',
                    caption: image.caption || '',
                    id: image.id || '',
                    link: image.link || '',
                    url: image.url || '',
                };
            } );

            this.onControlChange( result, control );
        }

        onSelectImage( image, control ) {
            let result = {
                alt: image.alt || '',
                caption: image.caption || '',
                id: image.id || '',
                link: image.link || '',
                url: image.url || '',
            };

            this.onControlChange( result, control );
        }

        /**
         * Render controls
         */
        renderControls( placement ) {
            const {
                attributes,
            } = this.props;

            let result = [];

            // prepare attributes.
            Object.keys(item.controls).forEach(( k ) => {
                const control = item.controls[k];

                if ( control.type && control.placement !== 'nowhere' && ( control.placement === 'both' || control.placement === placement ) ) {
                    switch ( control.type ) {
                        case 'text':
                        case 'number':
                        case 'url':
                        case 'email':
                        case 'password':
                            result.push((
                                <TextControl
                                    key={ control.name }
                                    label={ control.label }
                                    type={ control.type }
                                    value={ attributes[ control.name ] }
                                    onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                />
                            ));
                            break;
                        case 'textarea':
                            result.push((
                                <TextareaControl
                                    key={ control.name }
                                    label={ control.label }
                                    value={ attributes[ control.name ] }
                                    onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                />
                            ));
                            break;
                        case 'content_editor':
                            // TODO: Editor for content.
                            // result.push((
                            //     <RichText
                            //         key={ control.name }
                            //         label={ control.label }
                            //         value={ attributes[ control.name ] }
                            //         onChange={ ( val ) => { this.onControlChange( val, control ) } }
                            //     />
                            // ));
                            // break;
                            // save:
                            // return <RichText.Content value={ attributes[ control.name ] } />;
                        case 'wysiwyg_editor':
                            // TODO: Wysiwyg editor for content.
                            // result.push((
                            //     <RichText
                            //         key={ control.name }
                            //         label={ control.label }
                            //         content={ attributes[ control.name ] }
                            //         onChange={ ( val ) => { this.onControlChange( val, control ) } }
                            //     />
                            // ));
                            // break;
                            // save:
                            // return <RawHTML>{ attributes[ control.name ] }</RawHTML>;
                        case 'code_editor':
                            result.push((
                                <BaseControl
                                    key={ control.name }
                                    label={ control.label }
                                >
                                    <CodeEditor
                                        value={ attributes[ control.name ] }
                                        onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                    />
                                </BaseControl>
                            ));
                            break;
                        case 'select':
                            let choicesObject = [];

                            control.choices.split( '\n' ).forEach( ( val ) => {
                                const split = val.split( ' : ' );
                                choicesObject.push( {
                                    value: split[0].replace( /\n/g, '' ),
                                    label: ( split[1] || split[0] ).replace( /\n/g, '' ),
                                } );
                            } );

                            result.push((
                                <SelectControl
                                    key={ control.name }
                                    label={ control.label }
                                    options={ choicesObject }
                                    value={ attributes[ control.name ] }
                                    onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                />
                            ));
                            break;
                        case 'toggle':
                            result.push((
                                <ToggleControl
                                    key={ control.name }
                                    label={ control.label }
                                    checked={ !! attributes[ control.name ] }
                                    onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                />
                            ));
                            break;
                        case 'checkbox':
                            result.push((
                                <CheckboxControl
                                    key={ control.name }
                                    label={ control.label }
                                    checked={ !! attributes[ control.name ] }
                                    onChange={ ( val ) => { this.onControlChange( val, control ) } }
                                />
                            ));
                            break;
                        case 'image':
                            result.push((
                                <BaseControl key={ control.name } label={ control.label }>
                                    { ( () => {
                                        // when enable save in meta we only may save in string, number, boolean and integer types.
                                        if ( typeof attributes[ control.name ] === 'string' && 'true' === control.save_in_meta && control.save_in_meta_name ) {
                                            try {
                                                attributes[ control.name ] = JSON.parse( decodeURI( attributes[ control.name ] ) );
                                            } catch ( e ) {
                                                attributes[ control.name ] = {};
                                            }
                                        }
                                        return '';
                                    } )() }
                                    { !Object.keys( attributes[ control.name ] ).length ? (
                                        <MediaPlaceholder
                                            key={ control.name }
                                            icon="format-image"
                                            labels={ {
                                                title: __( control.label ),
                                                name: __( 'image' ),
                                            } }
                                            onSelect={ (image) => {
                                                this.onSelectImage( image, control );
                                            } }
                                            accept="image/*"
                                            type="image"
                                            disableMaxUploadErrorMessages
                                            onError={ (e) => {
                                                console.log(e);
                                            } }
                                        />
                                    ) : '' }
                                    { Object.keys( attributes[ control.name ] ).length ? (
                                        <Fragment>
                                            <div className="lzb-gutenberg-image" >
                                                <DropZoneProvider>
                                                    <DropZone
                                                        onFilesDrop={ (files) => {
                                                            editorMediaUpload( {
                                                                allowedType: 'image',
                                                                filesList: files,
                                                                onFileChange: ( image ) => {
                                                                    this.onSelectImage( image, control );
                                                                },
                                                                onError(e) {
                                                                    console.log(e);
                                                                },
                                                            } );
                                                        } }
                                                    />
                                                    <div className="lzb-gutenberg-image-button">
                                                        <Button
                                                            isDefault={ true }
                                                            onClick={ () => {
                                                                this.onControlChange( '', control );
                                                            } }
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    </div>
                                                    <div className="lzb-gutenberg-image-item" key={ attributes[ control.name ].id || attributes[ control.name ].url }>
                                                        <img src={ attributes[ control.name ].url } alt={ attributes[ control.name ].alt } />
                                                    </div>
                                                </DropZoneProvider>
                                            </div>
                                        </Fragment>
                                    ) : '' }
                                </BaseControl>
                            ));
                            break;
                        case 'gallery':
                            result.push((
                                <BaseControl key={ control.name } label={ control.label }>
                                    { ( () => {
                                        // when enable save in meta we only may save in string, number, boolean and integer types.
                                        if ( typeof attributes[ control.name ] === 'string' && 'true' === control.save_in_meta && control.save_in_meta_name ) {
                                            try {
                                                attributes[ control.name ] = JSON.parse( decodeURI( attributes[ control.name ] ) );
                                            } catch ( e ) {
                                                attributes[ control.name ] = [];
                                            }
                                        }
                                        return '';
                                    } )() }
                                    { !attributes[ control.name ].length ? (
                                        <MediaPlaceholder
                                            key={ control.name }
                                            icon="format-gallery"
                                            labels={ {
                                                title: __( control.label ),
                                                name: __( 'images' ),
                                            } }
                                            onSelect={ (images) => {
                                                this.onSelectImages( images, control );
                                            } }
                                            accept="image/*"
                                            type="image"
                                            disableMaxUploadErrorMessages
                                            multiple
                                            onError={ (e) => {
                                                console.log(e);
                                            } }
                                        />
                                    ) : '' }
                                    { attributes[ control.name ].length ? (
                                        <MediaUpload
                                            onSelect={ (images) => {
                                                this.onSelectImages( images, control );
                                            } }
                                            type="image"
                                            multiple
                                            gallery
                                            value={ attributes[ control.name ].map( ( img ) => img.id ) }
                                            render={ ( { open } ) => (
                                                <Fragment>
                                                    <div
                                                        className="lzb-gutenberg-gallery"
                                                        onClick={ open }
                                                    >
                                                        <DropZoneProvider>
                                                            <DropZone
                                                                onFilesDrop={ (files) => {
                                                                    const currentImages = attributes[ control.name ] || [];
                                                                    editorMediaUpload( {
                                                                        allowedType: 'image',
                                                                        filesList: files,
                                                                        onFileChange: ( images ) => {
                                                                            this.onControlChange( currentImages.concat( images ), control );
                                                                        },
                                                                        onError(e) {
                                                                            console.log(e);
                                                                        },
                                                                    } );
                                                                } }
                                                            />
                                                            <div className="lzb-gutenberg-gallery-button">
                                                                <Button isDefault={ true }>Edit Gallery</Button>
                                                            </div>
                                                            { attributes[ control.name ].map( ( img, index ) => (
                                                                <div className="lzb-gutenberg-gallery-item" key={ img.id || img.url }>
                                                                    <img src={ img.url } alt={ img.alt } />
                                                                </div>
                                                            ) ) }
                                                        </DropZoneProvider>
                                                    </div>
                                                </Fragment>
                                            ) }
                                        />
                                    ) : '' }
                                </BaseControl>
                            ));
                            break;
                    }
                }
            });

            // additional element for better formatting in inspector.
            if ( placement === 'inspector' && result.length ) {
                result = <PanelBody>{ result }</PanelBody>;
            }

            return result;
        }

        render() {
            let { className = '' } = this.props;

            className = classnames( 'lazyblock', className );

            return (
                <Fragment>
                    <InspectorControls>
                        <div className="lzb-inspector-controls">
                            { this.renderControls( 'inspector' ) }
                        </div>
                    </InspectorControls>
                    <div className={ className }>
                        <div className="lzb-content-controls">
                            { this.renderControls( 'content' ) }
                        </div>
                        123
                    </div>
                </Fragment>
            );
        }
    }

    // prepare attributes.
    const attributes = {};
    Object.keys(item.controls).forEach(( k ) => {
        const control = item.controls[k];
        let type = 'string';
        let default_val = control.default;

        if ( control.type ) {
            switch ( control.type ) {
                case 'number':
                    type = 'number';
                    break;
                case 'checkbox':
                case 'toggle':
                    type = 'boolean';
                    default_val = control.checked === 'true';
                    break;
                case 'image':
                    // when enable save in meta we only may save in string, number, boolean and integer types.
                    if ( 'true' !== control.save_in_meta && control.save_in_meta_name ) {
                        type = 'object';
                        default_val = {};
                    }
                    break;
                case 'gallery':
                    // when enable save in meta we only may save in string, number, boolean and integer types.
                    if ( 'true' !== control.save_in_meta && control.save_in_meta_name ) {
                        type = 'array';
                        default_val = [];
                    }
                    break;
            }
        }

        attributes[ control.name ] = {
            default: default_val,
            type,
        };

        if ( control.save_in_meta === 'true' && control.save_in_meta_name ) {
            attributes[ control.name ].source = 'meta';
            attributes[ control.name ].meta = control.save_in_meta_name;
        }
    });

    registerBlockType( item.slug, {
        title: item.title,
        description: item.description,
        icon: item.icon.replace( /^dashicons dashicons-/, '' ),
        category: item.category,
        keywords: item.keywords,
        supports: item.supports,
        useOnce: item.useOnce,

        attributes: attributes,

        edit: LazyBlock,

        save( { attributes, className } ) {
            className = classnames( 'lazyblock', className );

            return (
                <div className={ className } >
                    Test
                </div>
            );
        },
    } );
});
