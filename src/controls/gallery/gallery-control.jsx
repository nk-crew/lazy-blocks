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
    MediaUpload,
} = wp.blockEditor;

const {
    mediaUpload,
} = wp.editor;

const ALLOWED_MEDIA_TYPES = [ 'image' ];

class GalleryControl extends Component {
    constructor() {
        super( ...arguments );

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
            noticeOperations,
            noticeUI,
            onChange = () => {},
        } = this.props;

        return (
            <BaseControl
                label={ label }
                help={ help }
            >
                <div className="lzb-gutenberg-gallery-wrap">
                    { ! value || ! Object.keys( value ).length ? (
                        <MediaPlaceholder
                            icon="format-gallery"
                            labels={ {
                                title: label,
                                name: __( 'images', '@@text_domain' ),
                            } }
                            onSelect={ ( images ) => {
                                this.setState( { hasError: false } );
                                onChange( images );
                            } }
                            notices={ noticeUI }
                            accept="image/*"
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            disableMaxUploadErrorMessages
                            multiple
                            onError={ this.onUploadError }
                        />
                    ) : '' }
                    { value && Object.keys( value ).length ? (
                        <MediaUpload
                            onSelect={ ( images ) => {
                                this.setState( { hasError: false } );
                                onChange( images );
                            } }
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            multiple
                            gallery
                            value={ value.map( ( img ) => img.id ) }
                            render={ ( { open } ) => (
                                <div
                                    className="lzb-gutenberg-gallery"
                                    onClick={ open }
                                    role="presentation"
                                >
                                    <DropZone
                                        onFilesDrop={ ( files ) => {
                                            const currentImages = value || [];
                                            mediaUpload( {
                                                allowedTypes: ALLOWED_MEDIA_TYPES,
                                                filesList: files,
                                                onFileChange: ( images ) => {
                                                    this.setState( { hasError: false } );
                                                    onChange( currentImages.concat( images ) );
                                                },
                                                onError: ( message ) => {
                                                    this.setState( { hasError: true } );
                                                    noticeOperations.createErrorNotice( message );
                                                },
                                            } );
                                        } }
                                    />
                                    <div className="lzb-gutenberg-gallery-button">
                                        <Button isDefault={ true }>{ __( 'Edit Gallery', '@@text_domain' ) }</Button>
                                    </div>
                                    { value.map( ( img ) => (
                                        <div className="lzb-gutenberg-gallery-item" key={ img.id || img.url }>
                                            <img src={ img.url } alt={ img.alt } />
                                        </div>
                                    ) ) }
                                </div>
                            ) }
                        />
                    ) : '' }
                </div>
            </BaseControl>
        );
    }
}

export default compose( [
    withInstanceId,
    withNotices,
] )( GalleryControl );
