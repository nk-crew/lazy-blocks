// External Dependencies.
import classnames from 'classnames/dedupe';
import arrayMove from 'array-move';
import { throttle } from 'throttle-debounce';

// Internal Dependencies
import './blocks/free.jsx';
import './extensions/block-id.jsx';

import ColorControl from './controls/color.jsx';
import ImageControl from './controls/image.jsx';
import GalleryControl from './controls/gallery.jsx';
import FileControl from './controls/file.jsx';
import RepeaterControl from './controls/repeater.jsx';
import PreviewServerCallback from './blocks/preview-server-callback.jsx';

let options = window.lazyblocksGutenberg;
if ( ! options || ! options.blocks || ! options.blocks.length ) {
    options = { post_type: 'post', blocks: [] };
}

const {
    __,
} = wp.i18n;
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
    RadioControl,
    RangeControl,
    SelectControl,
    Dashicon,
    IconButton,
    DatePicker,
    TimePicker,
    Notice,
} = wp.components;

const {
    URLInput,
    InspectorControls,
    RichText,
    InnerBlocks,
    PlainText,
} = wp.editor;

const {
    registerBlockType,
} = wp.blocks;

const {
    withSelect,
    withDispatch,
} = wp.data;

const {
    compose,
} = wp.compose;

const getDateSettings = wp.date.__experimentalGetSettings;

// each registered block.
options.blocks.forEach( ( item ) => {
    class LazyBlock extends Component {
        constructor() {
            super( ...arguments );

            this.isControlValueValid = this.isControlValueValid.bind( this );
            this.maybeLockPostSaving = throttle( 500, this.maybeLockPostSaving.bind( this ) );
            this.getControlValue = this.getControlValue.bind( this );
            this.onControlChange = this.onControlChange.bind( this );
            this.onSelectImages = this.onSelectImages.bind( this );
            this.onSelectImage = this.onSelectImage.bind( this );
            this.renderControls = this.renderControls.bind( this );
        }

        componentDidMount() {
            this.maybeLockPostSaving();
        }
        componentDidUpdate() {
            this.maybeLockPostSaving();
        }

        isControlValueValid( val, control ) {
            let isValid = false;

            switch ( control.type ) {
            case 'select':
            case 'radio':
                if ( 'true' === control.allow_null ) {
                    isValid = true;
                } else {
                    isValid = '' !== val && typeof val !== 'undefined';
                }
                break;
            default:
                isValid = '' !== val && typeof val !== 'undefined';
            }

            return isValid;
        }

        maybeLockPostSaving() {
            let shouldLock = 0;
            let thereIsRequired = false;

            // check all controls
            Object.keys( item.controls ).forEach( ( k ) => {
                const control = item.controls[ k ];

                if ( control.required && 'true' === control.required ) {
                    thereIsRequired = true;

                    const val = this.getControlValue( control );

                    if ( ! this.isControlValueValid( val, control ) ) {
                        shouldLock += 1;
                    }
                }
            } );

            // no required controls available.
            if ( ! thereIsRequired ) {
                return;
            }

            // lock or unlock post saving depending on required controls values.
            if ( shouldLock > 0 ) {
                this.props.lockPostSaving();
            } else {
                this.props.unlockPostSaving();
            }
        }

        getControlValue( control, childIndex ) {
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
                (
                    'repeater' === control.type ||
                    'image' === control.type ||
                    'gallery' === control.type ||
                    'file' === control.type
                )
            ) {
                try {
                    result = JSON.parse( decodeURI( result ) );
                } catch ( e ) {
                    result = [];
                }
            }

            return result;
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
            if ( 'number' === control.type || 'range' === control.type ) {
                val = parseFloat( val );
            }

            const result = {};
            result[ name ] = val;

            // we only may save in string, number, boolean and integer types.
            if (
                ( typeof val === 'object' || Array.isArray( val ) ) &&
                (
                    'repeater' === control.type ||
                    'image' === control.type ||
                    'gallery' === control.type ||
                    'file' === control.type
                )
            ) {
                result[ name ] = encodeURI( JSON.stringify( result[ name ] ) );
            }

            setAttributes( result );
        }

        onSelectImages( images, control, childIndex ) {
            const result = images.map( ( image ) => {
                return {
                    alt: image.alt || '',
                    title: image.title || '',
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
                title: image.title || '',
                caption: image.caption || '',
                id: image.id || '',
                link: image.link || '',
                url: image.url || '',
            } : '';

            this.onControlChange( result, control, childIndex );
        }

        onSelectFile( file, control, childIndex ) {
            const result = file ? {
                alt: file.alt || '',
                title: file.title || '',
                caption: file.caption || '',
                id: file.id || '',
                link: file.link || '',
                url: file.url || '',
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
                let placementCheck = control.type && control.placement !== 'nowhere' &&
                ( control.placement === 'both' || control.placement === placement );
                let label = control.label;
                let maxlength = '';

                // inner blocks show only in content.
                if ( control.type === 'inner_blocks' ) {
                    placementCheck = placement === 'content';
                }

                // hide if not selected
                if ( placement === 'content' && control.hide_if_not_selected && 'true' === control.hide_if_not_selected ) {
                    placementCheck = this.props.isLazyBlockSelected;
                }

                // required mark
                if ( control.required && 'true' === control.required ) {
                    label = (
                        <Fragment>
                            { label }
                            <span className="required">*</span>
                        </Fragment>
                    );
                }

                // maxlength attribute
                if (
                    control.characters_limit && (
                        control.type === 'text' ||
                        control.type === 'textarea' ||
                        control.type === 'email' ||
                        control.type === 'password'
                    )
                ) {
                    maxlength = control.characters_limit ? parseInt( control.characters_limit ) : '';
                }

                // prepare control output
                if (
                    ( ! childOf && ! control.child_of && placementCheck ) ||
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
                                label={ label }
                                type={ control.type }
                                min={ control.min }
                                max={ control.max }
                                step={ control.step }
                                maxLength={ maxlength }
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
                                label={ label }
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
                                label={ label }
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
                                label={ label }
                                value={ this.getControlValue( control, childIndex ) }
                                maxLength={ maxlength }
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
                                label={ label }
                                help={ control.help }
                                className="lzb-gutenberg-rich-text"
                            >
                                <RichText
                                    value={ this.getControlValue( control, childIndex ) }
                                    format="string"
                                    multiline={ control.multiline === 'true' ? 'p' : false }
                                    inlineToolbar={ true }
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
                                label={ label }
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
                                label={ label }
                            >
                                <InnerBlocks />
                            </BaseControl>
                        ) );
                        break;
                    case 'select':
                        result.push( (
                            <SelectControl
                                key={ control.name }
                                label={ label }
                                options={ control.choices }
                                multiple={ 'true' === control.multiple }
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
                    case 'radio':
                        result.push( (
                            <RadioControl
                                key={ control.name }
                                label={ label }
                                help={ control.help }
                                selected={ this.getControlValue( control, childIndex ) }
                                options={ control.choices }
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
                                label={ label }
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
                                label={ label }
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
                                label={ label }
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
                                label={ label }
                                value={ this.getControlValue( control, childIndex ) }
                                help={ control.help }
                                onChange={ ( val ) => {
                                    this.onSelectImages( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'file':
                        result.push( (
                            <FileControl
                                key={ control.name }
                                label={ label }
                                value={ this.getControlValue( control, childIndex ) }
                                help={ control.help }
                                allowedMimeTypes={ control.allowed_mime_types }
                                onChange={ ( val ) => {
                                    this.onSelectFile( val, control, childIndex );
                                } }
                            />
                        ) );

                        break;
                    case 'color':
                        result.push( (
                            <ColorControl
                                key={ control.name }
                                label={ label }
                                value={ this.getControlValue( control, childIndex ) }
                                help={ control.help }
                                alpha={ control.alpha === 'true' }
                                onChange={ ( val ) => {
                                    this.onControlChange( val, control, childIndex );
                                } }
                            />
                        ) );
                        break;
                    case 'date_time':
                        const settings = getDateSettings();

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
                                label={ label }
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
                                label={ label }
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

                    // show error for required fields
                    if ( control.required && 'true' === control.required ) {
                        const val = this.getControlValue( control, childIndex );

                        if ( ! this.isControlValueValid( val, control ) ) {
                            result.push( (
                                <Notice
                                    key={ `notice-${ control.name }` }
                                    status="warning"
                                    isDismissible={ false }
                                >
                                    { __( 'This field is required' ) }
                                </Notice>
                            ) );
                        }
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
            const {
                blockUniqueClass = '',
            } = this.props.attributes;

            const className = classnames( 'lazyblock', blockUniqueClass );

            const attsForRender = {};

            // prepare data for preview.
            Object.keys( item.controls ).forEach( ( k ) => {
                if ( ! item.controls[ k ].child_of ) {
                    attsForRender[ item.controls[ k ].name ] = this.getControlValue( item.controls[ k ] );
                }
            } );

            // reserved attributes.
            const reservedAttributes = [
                'lazyblock',
                'className',
                'align',
                'anchor',
                'blockId',
                'blockUniqueClass',
            ];
            reservedAttributes.forEach( ( attr ) => {
                attsForRender[ attr ] = this.props.attributes[ attr ];
            } );

            // show code preview
            let showPreview = true;

            switch ( item.code.show_preview ) {
            case 'selected':
                showPreview = this.props.isLazyBlockSelected;
                break;
            case 'unselected':
                showPreview = ! this.props.isLazyBlockSelected;
                break;
            case 'never':
                showPreview = false;
                break;
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
                            <h6>{ item.title }</h6>
                        </div>
                        <div className="lzb-content-controls">
                            { this.renderControls( 'content' ) }
                        </div>
                        { showPreview ? (
                            <PreviewServerCallback
                                block={ item.slug }
                                attributes={ attsForRender }
                            />
                        ) : '' }
                    </div>
                </Fragment>
            );
        }
    }

    const LazyBlockWithSelect = compose( [
        withSelect( ( select, ownProps ) => {
            const {
                hasSelectedInnerBlock,
            } = select( 'core/editor' );

            return {
                isLazyBlockSelected: ownProps.isSelected || hasSelectedInnerBlock( ownProps.clientId ),
            };
        } ),
        withDispatch( ( dispatch, ownProps ) => {
            const {
                lockPostSaving,
                unlockPostSaving,
            } = dispatch( 'core/editor' );

            return {
                lockPostSaving() {
                    lockPostSaving( `lazyblock-${ ownProps.clientId }` );
                },
                unlockPostSaving() {
                    unlockPostSaving( `lazyblock-${ ownProps.clientId }` );
                },
            };
        } ),
    ] )( LazyBlock );

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

        ghostkit: item.ghostkit,

        lazyblock: true,

        edit: LazyBlockWithSelect,

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
