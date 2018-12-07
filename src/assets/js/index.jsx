// External Dependencies.
import Handlebars from './handlebars.jsx';
import classnames from 'classnames/dedupe';
import { arrayMove } from 'react-sortable-hoc';

// Internal Dependencies
require( './blocks/free.jsx' );
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
    RangeControl,
    SelectControl,
    ColorIndicator,
    Dashicon,
    IconButton,
    DatePicker,
    TimePicker,
} = wp.components;

const {
    URLInput,
    ColorPalette,
    InspectorControls,
    RichText,
    InnerBlocks,
    PlainText,
} = wp.editor;

const {
    registerBlockType,
} = wp.blocks;

const getSettings = wp.date.__experimentalGetSettings;

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

            // convert string in number type.
            if ( 'number' === control.type ) {
                val = parseFloat( val );
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
                    switch ( control.type ) {
                    case 'text':
                    case 'number':
                    case 'email':
                    case 'password':
                        result.push( (
                            <TextControl
                                key={ control.name }
                                label={ control.label }
                                type={ control.type }
                                min={ control.min }
                                max={ control.max }
                                step={ control.step }
                                help={ control.help }
                                placeholder={ control.placeholder }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'range':
                        result.push( (
                            <RangeControl
                                key={ control.name }
                                label={ control.label }
                                min={ control.min }
                                max={ control.max }
                                step={ control.step }
                                help={ control.help }
                                value={ this.getControlValue( control, childIndex ) }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'url':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                                help={ control.help }
                            >
                                <form
                                    className="lzb-gutenberg-url"
                                    onSubmit={ ( event ) => event.preventDefault() }>
                                    <URLInput
                                        value={ this.getControlValue( control, childIndex ) }
                                        onChange={ ( val ) => {
                                            this.onControlChange( val, control, childIndex );
                                        } }
                                        autoFocus={ false }
                                    />
                                    <Dashicon icon="admin-links" />
                                    <IconButton icon="editor-break" label="Apply" type="submit" />
                                </form>
                            </BaseControl>
                        ) );
                        break;
                    case 'textarea':
                        result.push( (
                            <TextareaControl
                                key={ control.name }
                                label={ control.label }
                                value={ this.getControlValue( control, childIndex ) }
                                help={ control.help }
                                placeholder={ control.placeholder }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'rich_text':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                                help={ control.help }
                                className="lzb-gutenberg-rich-text"
                            >
                                <RichText
                                    value={ this.getControlValue( control, childIndex ) }
                                    format="string"
                                    multiline={ control.multiline === 'true' ? 'p' : false }
                                    inlineToolbar={ true }
                                    isSelected={ true }
                                    onChange={ ( val ) => {
                                        this.onControlChange( val, control, childIndex );
                                    } }
                                />
                            </BaseControl>
                        ) );
                        break;
                    case 'code_editor':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                                help={ control.help }
                                className="wp-block-html"
                            >
                                <PlainText
                                    value={ this.getControlValue( control, childIndex ) }
                                    onChange={ ( val ) => {
                                        this.onControlChange( val, control, childIndex );
                                    } }
                                />
                            </BaseControl>
                        ) );
                        break;
                    case 'inner_blocks':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                            >
                                <InnerBlocks />
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
                                help={ control.help }
                                onChange={ ( val ) => {
                                    if ( control.allow_null && 'true' === control.allow_null && 'null' === val ) {
                                        val = null;
                                    }
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
                                help={ control.help }
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
                                help={ control.help }
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
                                help={ control.help }
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
                                help={ control.help }
                                onChange={ ( val ) => {
                                    this.onSelectImages( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'color':
                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ (
                                    <Fragment>
                                        { control.label }
                                        <ColorIndicator colorValue={ this.getControlValue( control, childIndex ) } />
                                    </Fragment>
                                ) }
                                help={ control.help }
                                className="lzb-gutenberg-color"
                            >
                                <ColorPalette
                                    value={ this.getControlValue( control, childIndex ) }
                                    onChange={ ( val ) => {
                                        this.onControlChange( val, control, childIndex );
                                    } }
                                />
                            </BaseControl>
                        ) );
                        break;
                    case 'date_time':
                        const settings = getSettings();

                        // To know if the current timezone is a 12 hour time with look for "a" in the time format.
                        // We also make sure this a is not escaped by a "/".
                        const is12HourTime = /a(?!\\)/i.test(
                            settings.formats.time
                                .toLowerCase() // Test only the lower case a
                                .replace( /\\\\/g, '' ) // Replace "//" with empty strings
                                .split( '' ).reverse().join( '' ) // Reverse the string and test for "a" not followed by a slash
                        );

                        result.push( (
                            <BaseControl
                                key={ control.name }
                                label={ control.label }
                                help={ control.help }
                            >
                                { /date/.test( control.date_time_picker ) ? (
                                    <DatePicker
                                        currentDate={ this.getControlValue( control, childIndex ) }
                                        onChange={ ( val ) => {
                                            this.onControlChange( val, control, childIndex );
                                        } }
                                        locale={ settings.l10n.locale }
                                    />
                                ) : '' }
                                { /time/.test( control.date_time_picker ) ? (
                                    <TimePicker
                                        currentTime={ this.getControlValue( control, childIndex ) }
                                        onChange={ ( val ) => {
                                            this.onControlChange( val, control, childIndex );
                                        } }
                                        is12Hour={ is12HourTime }
                                    />
                                ) : '' }
                            </BaseControl>
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
                                resortRow={ ( oldIndex, newIndex ) => {
                                    const newVal = arrayMove( val, oldIndex, newIndex );
                                    this.onControlChange( newVal, control, childIndex );
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
                        <div className="lzb-content-title">
                            { item.icon ? (
                                <span className={ item.icon } />
                            ) : '' }
                            <span>{ item.title }</span>
                        </div>
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
            let result = null;

            // Return inner blocks content to use it in PHP render.
            Object.keys( item.controls ).forEach( ( k ) => {
                if ( 'inner_blocks' === item.controls[ k ].type ) {
                    result = <InnerBlocks.Content />;
                }
            } );

            return result;
        },
    } );
} );
