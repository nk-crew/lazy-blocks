const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    Button,
    DropZone,
} = wp.components;

const {
    withInstanceId,
} = wp.compose;

const {
    MediaPlaceholder,
    mediaUpload,
} = wp.editor;

const ALLOWED_MEDIA_TYPES = [ 'image' ];

class ImageControl extends Component {
    render() {
        const {
            label,
            value,
            help,
            onChange = () => {},
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
                                name: __( 'image' ),
                            } }
                            onSelect={ ( image ) => {
                                onChange( image );
                            } }
                            accept="image/*"
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            disableMaxUploadErrorMessages
                            onError={ ( e ) => {
                                // eslint-disable-next-line no-console
                                console.log( e );
                            } }
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
                                            onChange( image );
                                        },
                                        onError( e ) {
                                            // eslint-disable-next-line no-console
                                            console.log( e );
                                        },
                                    } );
                                } }
                            />
                            <div className="lzb-gutenberg-image-button">
                                <Button
                                    isDefault={ true }
                                    onClick={ () => {
                                        onChange( '' );
                                    } }
                                >
                                    Remove Image
                                </Button>
                            </div>
                            <div className="lzb-gutenberg-image-item" key={ value.id || value.url }>
                                <img src={ value.url } alt={ value.alt } />
                            </div>
                        </div>
                    ) : '' }
                </div>
            </BaseControl>
        );
    }
}

export default withInstanceId( ImageControl );
