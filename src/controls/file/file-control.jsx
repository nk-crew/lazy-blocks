const { __ } = wp.i18n;
const { Component } = wp.element;
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
} = wp.blockEditor;

const {
    mediaUpload,
} = wp.editor;

const {
    allowed_mime_types: wpAllowedMimeTypes,
} = window.lazyblocksConstructorData || window.lazyblocksGutenberg;

class FileControl extends Component {
    render() {
        const {
            label,
            value,
            help,
            allowedMimeTypes,
            onChange = () => {},
        } = this.props;

        const ALLOWED_MEDIA_TYPES = [];

        if ( allowedMimeTypes ) {
            allowedMimeTypes.forEach( ( typeName ) => {
                if ( wpAllowedMimeTypes[ typeName ] ) {
                    ALLOWED_MEDIA_TYPES.push( wpAllowedMimeTypes[ typeName ] );
                }
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
                                name: __( 'file' ),
                            } }
                            onSelect={ ( file ) => {
                                onChange( file );
                            } }
                            allowedTypes={ ALLOWED_MEDIA_TYPES }
                            disableMaxUploadErrorMessages
                            onError={ ( e ) => {
                                // eslint-disable-next-line no-console
                                console.log( e );
                            } }
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
                                            onChange( file );
                                        },
                                        onError( e ) {
                                            // eslint-disable-next-line no-console
                                            console.log( e );
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
                                    <div className="lzb-gutenberg-file-item-content-filename">{ value.url.replace( /^.*[\\\/]/, '' ) }</div>
                                </div>
                            </div>
                            <div className="lzb-gutenberg-file-button">
                                <Button
                                    isDefault={ true }
                                    onClick={ () => {
                                        onChange( '' );
                                    } }
                                >
                                    { __( 'Remove File' ) }
                                </Button>
                            </div>
                        </div>
                    ) : '' }
                </div>
            </BaseControl>
        );
    }
}

export default withInstanceId( FileControl );
