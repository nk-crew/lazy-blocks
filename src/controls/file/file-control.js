const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    Button,
    DropZone,
    withNotices,
} = wp.components;

const {
    compose,
    withInstanceId,
} = wp.compose;

const {
    MediaPlaceholder,
} = wp.blockEditor;

const {
    withSelect,
} = wp.data;

const {
    allowed_mime_types: wpAllowedMimeTypes,
} = window.lazyblocksConstructorData || window.lazyblocksGutenberg;

/* eslint-disable react/no-unused-state */

class FileControl extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            hasError: false,
        };

        this.onUploadError = this.onUploadError.bind( this );
    }

    onUploadError( message ) {
        const { noticeOperations } = this.props;
        noticeOperations.removeAllNotices();
        noticeOperations.createErrorNotice( message );
    }

    render() {
        const {
            label,
            value,
            help,
            allowedMimeTypes,
            noticeOperations,
            noticeUI,
            onChange = () => {},
            mediaUpload,
        } = this.props;

        const ALLOWED_MEDIA_TYPES = [];

        // If selected specific media types.
        if ( allowedMimeTypes && allowedMimeTypes.length ) {
            allowedMimeTypes.forEach( ( typeName ) => {
                if ( wpAllowedMimeTypes[ typeName ] ) {
                    ALLOWED_MEDIA_TYPES.push( wpAllowedMimeTypes[ typeName ] );
                }
            } );

            // If nothing selected - all types allowed.
        } else {
            Object.keys( wpAllowedMimeTypes ).forEach( ( typeName ) => {
                ALLOWED_MEDIA_TYPES.push( wpAllowedMimeTypes[ typeName ] );
            } );
        }

        return (
            <BaseControl
                label={ label }
                help={ help }
            >
                <div className="lzb-gutenberg-file-wrap">
                    { ! value || ! Object.keys( value ).length ? (
                        <MediaPlaceholder
                            icon="media-default"
                            labels={ {
                                title: label,
                                name: __( 'file', '@@text_domain' ),
                            } }
                            onSelect={ ( file ) => {
                                this.setState( { hasError: false } );
                                onChange( file );
                            } }
                            notices={ noticeUI }
                            accept={ ALLOWED_MEDIA_TYPES }
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            disableMaxUploadErrorMessages
                            onError={ this.onUploadError }
                        />
                    ) : '' }
                    { value && Object.keys( value ).length ? (
                        <div className="lzb-gutenberg-file">
                            <DropZone
                                onFilesDrop={ ( files ) => {
                                    mediaUpload( {
                                        allowedTypes: ALLOWED_MEDIA_TYPES,
                                        filesList: files,
                                        onFileChange: ( file ) => {
                                            this.setState( { hasError: false } );
                                            onChange( file[ 0 ] );
                                        },
                                        onError: ( message ) => {
                                            this.setState( { hasError: true } );
                                            noticeOperations.createErrorNotice( message );
                                        },
                                    } );
                                } }
                            />
                            <div className="lzb-gutenberg-file-item" key={ value.id || value.url }>
                                <div className="lzb-gutenberg-file-item-icon">
                                    <span className="dashicons dashicons-media-default" />
                                </div>
                                <div className="lzb-gutenberg-file-item-content">
                                    <div className="lzb-gutenberg-file-item-content-title">{ value.title }</div>
                                    <div className="lzb-gutenberg-file-item-content-filename">{ value.url.replace( /^.*[\\/]/, '' ) }</div>
                                </div>
                            </div>
                            <div className="lzb-gutenberg-file-button">
                                <Button
                                    isSecondary
                                    isSmall
                                    onClick={ () => {
                                        this.setState( { hasError: false } );
                                        onChange( '' );
                                    } }
                                >
                                    { __( 'Remove File', '@@text_domain' ) }
                                </Button>
                            </div>
                        </div>
                    ) : '' }
                </div>
            </BaseControl>
        );
    }
}

export default compose( [
    withSelect( ( select ) => {
        const {
            mediaUpload,
        } = select( 'core/block-editor' ).getSettings();

        return {
            mediaUpload,
        };
    } ),
    withInstanceId,
    withNotices,
] )( FileControl );
