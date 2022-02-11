const { __ } = wp.i18n;
const { Component } = wp.element;
const { BaseControl, Button, DropZone, withNotices } = wp.components;

const { compose, withInstanceId } = wp.compose;

const { MediaPlaceholder, MediaUpload } = wp.blockEditor;

const { withSelect } = wp.data;

const ALLOWED_MEDIA_TYPES = ['image'];

/* eslint-disable react/no-unused-state */

class GalleryControl extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      hasError: false,
    };

    this.onUploadError = this.onUploadError.bind(this);
  }

  onUploadError(message) {
    const { noticeOperations } = this.props;
    noticeOperations.removeAllNotices();
    noticeOperations.createErrorNotice(message);
  }

  render() {
    const {
      label,
      value,
      help,
      imagesPreviewData,
      noticeOperations,
      noticeUI,
      onChange = () => {},
      mediaUpload,
    } = this.props;

    return (
      <BaseControl label={label} help={help}>
        <div className="lzb-gutenberg-gallery-wrap">
          {!value || !Object.keys(value).length ? (
            <MediaPlaceholder
              icon="format-gallery"
              labels={{
                title: label,
                name: __('images', '@@text_domain'),
              }}
              onSelect={(images) => {
                this.setState({ hasError: false });
                onChange(images);
              }}
              notices={noticeUI}
              accept="image/*"
              allowedTypes={ALLOWED_MEDIA_TYPES}
              disableMaxUploadErrorMessages
              multiple
              onError={this.onUploadError}
            />
          ) : (
            ''
          )}
          {value && Object.keys(value).length ? (
            <MediaUpload
              onSelect={(images) => {
                this.setState({ hasError: false });
                onChange(images);
              }}
              allowedTypes={ALLOWED_MEDIA_TYPES}
              multiple
              gallery
              value={value.map((img) => img.id)}
              render={({ open }) => (
                <div className="lzb-gutenberg-gallery" onClick={open} role="presentation">
                  <DropZone
                    onFilesDrop={(files) => {
                      const currentImages = value || [];
                      mediaUpload({
                        allowedTypes: ALLOWED_MEDIA_TYPES,
                        filesList: files,
                        onFileChange: (images) => {
                          this.setState({ hasError: false });
                          onChange(currentImages.concat(images));
                        },
                        onError: (message) => {
                          this.setState({ hasError: true });
                          noticeOperations.createErrorNotice(message);
                        },
                      });
                    }}
                  />
                  <div className="lzb-gutenberg-gallery-button">
                    <Button isSecondary isSmall>
                      {__('Edit Gallery', '@@text_domain')}
                    </Button>
                  </div>
                  {value.map((img) => (
                    <div className="lzb-gutenberg-gallery-item" key={img.id || img.url}>
                      {imagesPreviewData[img.id] && imagesPreviewData[img.id].url ? (
                        <img
                          src={imagesPreviewData[img.id].url}
                          alt={imagesPreviewData[img.id].alt}
                        />
                      ) : (
                        ''
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
          ) : (
            ''
          )}
        </div>
      </BaseControl>
    );
  }
}

export default compose([
  withInstanceId,
  withNotices,
  withSelect((select, ownProps) => {
    const { mediaUpload } = select('core/block-editor').getSettings();

    const { getMedia } = select('core');

    const { value, previewSize } = ownProps;

    const imagesPreviewData = {};

    if (value && Object.keys(value).length) {
      value.forEach((img) => {
        if (!imagesPreviewData[img.id]) {
          const mediaImg = getMedia(img.id) || false;

          if (mediaImg) {
            imagesPreviewData[img.id] = {
              alt: mediaImg.alt_text,
              url: mediaImg.source_url,
            };

            if (
              mediaImg.media_details &&
              mediaImg.media_details.sizes &&
              mediaImg.media_details.sizes[previewSize]
            ) {
              imagesPreviewData[img.id].url = mediaImg.media_details.sizes[previewSize].source_url;
            }
          }
        }
      });
    }

    return {
      mediaUpload,
      imagesPreviewData,
    };
  }),
])(GalleryControl);
