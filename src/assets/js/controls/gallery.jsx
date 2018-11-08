const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    Button,
    DropZoneProvider,
    DropZone,
} = wp.components;

const {
    withInstanceId,
} = wp.compose;

const {
    MediaPlaceholder,
    MediaUpload,
    mediaUpload,
} = wp.editor;

const ALLOWED_MEDIA_TYPES = [ 'image' ];

class GalleryControl extends Component {
    render() {
        const {
            label,
            value,
            onChange = () => {},
        } = this.props;

        return (
            <BaseControl label={ label }>
                { ! value || ! Object.keys( value ).length ? (
                    <MediaPlaceholder
                        icon="format-gallery"
                        labels={ {
                            title: label,
                            name: __( 'images' ),
                        } }
                        onSelect={ ( images ) => {
                            onChange( images );
                        } }
                        accept="image/*"
                        allowedTypes={ ALLOWED_MEDIA_TYPES }
                        disableMaxUploadErrorMessages
                        multiple
                        onError={ ( e ) => {
                            // eslint-disable-next-line no-console
                            console.log( e );
                        } }
                    />
                ) : '' }
                { value && Object.keys( value ).length ? (
                    <MediaUpload
                        onSelect={ ( images ) => {
                            onChange( images );
                        } }
                        type="image"
                        multiple
                        gallery
                        value={ value.map( ( img ) => img.id ) }
                        render={ ( { open } ) => (
                            <div
                                className="lzb-gutenberg-gallery"
                                onKeyPress={ open }
                                role="presentation"
                            >
                                <DropZoneProvider>
                                    <DropZone
                                        onFilesDrop={ ( files ) => {
                                            const currentImages = value || [];
                                            mediaUpload( {
                                                allowedTypes: ALLOWED_MEDIA_TYPES,
                                                filesList: files,
                                                onFileChange: ( images ) => {
                                                    onChange( currentImages.concat( images ) );
                                                },
                                                onError( e ) {
                                                    // eslint-disable-next-line no-console
                                                    console.log( e );
                                                },
                                            } );
                                        } }
                                    />
                                    <div className="lzb-gutenberg-gallery-button">
                                        <Button isDefault={ true }>Edit Gallery</Button>
                                    </div>
                                    { value.map( ( img ) => (
                                        <div className="lzb-gutenberg-gallery-item" key={ img.id || img.url }>
                                            <img src={ img.url } alt={ img.alt } />
                                        </div>
                                    ) ) }
                                </DropZoneProvider>
                            </div>
                        ) }
                    />
                ) : '' }
            </BaseControl>
        );
    }
}

export default withInstanceId( GalleryControl );
