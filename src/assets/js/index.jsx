import Handlebars from './handlebars.jsx';

// External Dependencies.
import classnames from 'classnames/dedupe';

// Internal Dependencies
import ImageControl from './controls/image.jsx';
import GalleryControl from './controls/gallery.jsx';
import RepeaterControl from './controls/repeater.jsx';

let options = window.lazyblocksGutenberg;
if ( ! options || ! options.blocks || ! options.blocks.length ) {
    options = { post_type: 'post', blocks: [] };
}

const {
    Component,
    Fragment,
} = wp.element;
const {
    PanelBody,
    BaseControl,
    TextControl,
    TextareaControl,
    ToggleControl,
    CheckboxControl,
    CodeEditor,
    SelectControl,
} = wp.components;

const {
    InspectorControls,
} = wp.editor;

const {
    registerBlockType,
} = wp.blocks;

// each registered block.
options.blocks.forEach( ( item ) => {
    // prepare Handlebars templates.
    let handlebarsEditorHtml = false;
    if ( item.code && item.code.editor_html ) {
        handlebarsEditorHtml = Handlebars.compile( item.code.editor_html );
    }

    function getControlValue( control, childIndex ) {
        const {
            attributes,
        } = this.props;

        let result = attributes[ control.name ];

        // prepare repeater items.
        if ( control.child_of && item.controls[ control.child_of ] && childIndex > -1 ) {
            const childs = this.getControlValue( item.controls[ control.child_of ] );
            if ( childs && typeof childs[ childIndex ] !== 'undefined' && typeof childs[ childIndex ][ control.name ] !== 'undefined' ) {
                result = childs[ childIndex ][ control.name ];
            }
        }

        // convert string to array.
        if (
            typeof result === 'string' &&
            ( 'repeater' === control.type || 'image' === control.type || 'gallery' === control.type )
        ) {
            try {
                result = JSON.parse( decodeURI( result ) );
            } catch ( e ) {
                result = [];
            }
        }

        return result;
    }

    class LazyBlock extends Component {
        constructor() {
            super( ...arguments );
            this.getControlValue = getControlValue.bind( this );
            this.onControlChange = this.onControlChange.bind( this );
            this.onSelectImages = this.onSelectImages.bind( this );
            this.onSelectImage = this.onSelectImage.bind( this );
            this.renderControls = this.renderControls.bind( this );
        }

        onControlChange( val, control, childIndex ) {
            const {
                setAttributes,
            } = this.props;

            let name = control.name;

            // prepare repeater items.
            if ( control.child_of && item.controls[ control.child_of ] && childIndex > -1 ) {
                const childs = this.getControlValue( item.controls[ control.child_of ] );
                if ( childs && typeof childs[ childIndex ] !== 'undefined' ) {
                    childs[ childIndex ][ control.name ] = val;
                    val = childs;
                }

                control = item.controls[ control.child_of ];
                name = control.name;
            }

            const result = {};
            result[ name ] = val;

            // we only may save in string, number, boolean and integer types.
            if (
                ( typeof val === 'object' || Array.isArray( val ) ) &&
                ( 'repeater' === control.type || 'image' === control.type || 'gallery' === control.type )
            ) {
                result[ name ] = encodeURI( JSON.stringify( result[ name ] ) );
            }

            setAttributes( result );
        }

        onSelectImages( images, control, childIndex ) {
            const result = images.map( ( image ) => {
                return {
                    alt: image.alt || '',
                    caption: image.caption || '',
                    id: image.id || '',
                    link: image.link || '',
                    url: image.url || '',
                };
            } );

            this.onControlChange( result, control, childIndex );
        }

        onSelectImage( image, control, childIndex ) {
            const result = image ? {
                alt: image.alt || '',
                caption: image.caption || '',
                id: image.id || '',
                link: image.link || '',
                url: image.url || '',
            } : '';

            this.onControlChange( result, control, childIndex );
        }

        /**
         * Render controls
         *
         * @param {String} placement - controls placement [inspector, content]
         * @param {String|Boolean} childOf - parent control name.
         * @param {Number|Boolean} childIndex - child index in parent.
         * @returns {Array} react blocks with controls.
         */
        renderControls( placement, childOf = '', childIndex = false ) {
            let result = [];

            // prepare attributes.
            Object.keys( item.controls ).forEach( ( k ) => {
                const control = item.controls[ k ];

                if (
                    ( ! childOf && ! control.child_of &&
                        control.type && control.placement !== 'nowhere' &&
                      ( control.placement === 'both' || control.placement === placement )
                    ) ||
                    ( childOf && control.child_of === childOf )
                ) {
                    // TODO: additional controls - color, color palette, date-time, range slider
                    switch ( control.type ) {
                    case 'text':
                    case 'number':
                    case 'url':
                    case 'email':
                    case 'password':
                        result.push( (
                            <TextControl
                                key={ control.name }
                                label={ control.label }
                                type={ control.type }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'textarea':
                        result.push( (
                            <TextareaControl
                                key={ control.name }
                                label={ control.label }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
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
                        // fall through
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
                        // fall through
                    case 'code_editor':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                            >
                                <CodeEditor
                                    value={ this.getControlValue( control, childIndex ) }
                                    onChange={ ( val ) => {
                                        this.onControlChange( val, control, childIndex );
                                    } }
                                />
                            </BaseControl>
                        ) );
                        break;
                    case 'select':
                        result.push( (
                            <SelectControl
                                key={ control.name }
                                label={ control.label }
                                options={ control.choices }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'toggle':
                        result.push( (
                            <ToggleControl
                                key={ control.name }
                                label={ control.label }
                                checked={ !! this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'checkbox':
                        result.push( (
                            <CheckboxControl
                                key={ control.name }
                                label={ control.label }
                                checked={ !! this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'image':
                        result.push( (
                            <ImageControl
                                key={ control.name }
                                label={ control.label }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onSelectImage( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'gallery':
                        result.push( (
                            <GalleryControl
                                key={ control.name }
                                label={ control.label }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onSelectImages( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'repeater':
                        const val = this.getControlValue( control, childIndex );

                        result.push( (
                            <RepeaterControl
                                key={ control.name }
                                label={ control.label }
                                count={ val.length }
                                renderRow={ ( index ) => (
                                    <Fragment>
                                        { this.renderControls( placement, k, index ) }
                                    </Fragment>
                                ) }
                                removeRow={ ( i ) => {
                                    if ( i > -1 ) {
                                        val.splice( i, 1 );
                                        this.onControlChange( val, control, childIndex );
                                    }
                                } }
                                addRow={ () => {
                                    val.push( {} );
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    }
                }
            } );

            // additional element for better formatting in inspector.
            if ( placement === 'inspector' && result.length ) {
                result = <PanelBody>{ result }</PanelBody>;
            }

            return result;
        }

        render() {
            let { className = '' } = this.props;

            className = classnames( 'lazyblock', className );

            const attsForRender = {};
            if ( handlebarsEditorHtml ) {
                Object.keys( item.controls ).forEach( ( k ) => {
                    if ( ! item.controls[ k ].child_of ) {
                        attsForRender[ item.controls[ k ].name ] = this.getControlValue( item.controls[ k ] );
                    }
                } );
            }

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
                        { handlebarsEditorHtml ? (
                            <div
                                dangerouslySetInnerHTML={ {
                                    __html: handlebarsEditorHtml( attsForRender ),
                                } }
                            />
                        ) : '' }
                    </div>
                </Fragment>
            );
        }
    }

    // conditionally show for specific post type.
    if ( item.supports.inserter && item.condition.length ) {
        let preventInsertion = true;
        item.condition.forEach( ( val ) => {
            if ( val === options.post_type ) {
                preventInsertion = false;
            }
        } );
        item.supports.inserter = ! preventInsertion;
    }

    // register block.
    registerBlockType( item.slug, {
        title: item.title,
        description: item.description,
        icon: item.icon.replace( /^dashicons dashicons-/, '' ),
        category: item.category,
        keywords: item.keywords,
        supports: item.supports,

        edit: LazyBlock,

        save() {
            // render in PHP.
            return null;
        },
    } );
} );
