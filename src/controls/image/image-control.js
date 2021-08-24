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

const ALLOWED_MEDIA_TYPES = [ 'image' ];

/* eslint-disable react/no-unused-state */

class ImageControl extends Component {
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
            imagePreviewData,
            noticeOperations,
            noticeUI,
            onChange = () => {},
            mediaUpload,
        } = this.props;

        return (
            <BaseControl
                label={ label }
                help={ help }
            >
                <div className="lzb-gutenberg-image-wrap">
                    { ! value || ! Object.keys( value ).length ? (
                        <MediaPlaceholder
                            icon="format-image"
                            labels={ {
                                title: label,
                                name: __( 'image', '@@text_domain' ),
                            } }
                            onSelect={ ( image ) => {
                                this.setState( { hasError: false } );
                                onChange( image );
                            } }
                            notices={ noticeUI }
                            accept="image/*"
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            disableMaxUploadErrorMessages
                            onError={ this.onUploadError }
                        />
                    ) : '' }
                    { value && Object.keys( value ).length ? (
                        <div className="lzb-gutenberg-image">
                            <DropZone
                                onFilesDrop={ ( files ) => {
                                    mediaUpload( {
                                        allowedTypes: ALLOWED_MEDIA_TYPES,
                                        filesList: files,
                                        onFileChange: ( image ) => {
                                            this.setState( { hasError: false } );
                                            onChange( image[ 0 ] );
                                        },
                                        onError: ( message ) => {
                                            this.setState( { hasError: true } );
                                            noticeOperations.createErrorNotice( message );
                                        },
                                    } );
                                } }
                            />
                            <div className="lzb-gutenberg-image-button">
                                <Button
                                    isSecondary
                                    isSmall
                                    onClick={ () => {
                                        this.setState( { hasError: false } );
                                        onChange( '' );
                                    } }
                                >
                                    { __( 'Remove Image', '@@text_domain' ) }
                                </Button>
                            </div>
                            <div className="lzb-gutenberg-image-item" key={ value.id || value.url }>
                                { imagePreviewData.url ? (
                                    <img src={ imagePreviewData.url } alt={ imagePreviewData.alt } />
                                ) : '' }
                            </div>
                        </div>
                    ) : '' }
                </div>
            </BaseControl>
        );
    }
}

export default compose( [
    withInstanceId,
    withNotices,
    withSelect( ( select, ownProps ) => {
        const {
            mediaUpload,
        } = select( 'core/block-editor' ).getSettings();

        const {
            getMedia,
        } = select( 'core' );

        const {
            value,
            previewSize,
        } = ownProps;

        let imagePreviewData = false;

        if ( value && Object.keys( value ).length && value.id ) {
            const mediaImg = getMedia( value.id ) || false;

            if ( mediaImg ) {
                imagePreviewData = {
                    alt: mediaImg.alt_text,
                    url: mediaImg.source_url,
                };

                if ( mediaImg.media_details && mediaImg.media_details.sizes && mediaImg.media_details.sizes[ previewSize ] ) {
                    imagePreviewData.url = mediaImg.media_details.sizes[ previewSize ].source_url;
                }
            }
        }

        return {
            mediaUpload,
            imagePreviewData,
        };
    } ),
] )( ImageControl );
