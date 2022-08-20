/* eslint-disable react/no-unused-state */
const { __ } = wp.i18n;

const { BaseControl, Button, DropZone, withNotices } = wp.components;

const { MediaPlaceholder } = wp.blockEditor;

const { useSelect } = wp.data;

const ALLOWED_MEDIA_TYPES = ['image'];

function ImageControl(props) {
  const {
    label,
    value,
    previewSize,
    help,
    noticeOperations,
    noticeUI,
    onChange = () => {},
  } = props;

  const { mediaUpload, imagePreviewData } = useSelect((select) => {
    const { getMedia } = select('core');

    let preview = false;

    if (value && Object.keys(value).length && value.id) {
      const mediaImg = getMedia(value.id) || false;

      if (mediaImg) {
        preview = {
          alt: mediaImg.alt_text,
          url: mediaImg.source_url,
        };

        if (
          mediaImg.media_details &&
          mediaImg.media_details.sizes &&
          mediaImg.media_details.sizes[previewSize]
        ) {
          preview.url = mediaImg.media_details.sizes[previewSize].source_url;
        }
      }
    }

    return {
      mediaUpload: select('core/block-editor').getSettings().mediaUpload,
      imagePreviewData: preview,
    };
  });

  function onUploadError(message) {
    noticeOperations.removeAllNotices();
    noticeOperations.createErrorNotice(message);
  }

  return (
    <BaseControl label={label} help={help}>
      <div className="lzb-gutenberg-image-wrap">
        {!value || !Object.keys(value).length ? (
          <MediaPlaceholder
            icon="format-image"
            labels={{
              title: label,
              name: __('image', 'lazy-blocks'),
            }}
            onSelect={(image) => {
              onChange(image);
            }}
            notices={noticeUI}
            accept="image/*"
            allowedTypes={ALLOWED_MEDIA_TYPES}
            disableMaxUploadErrorMessages
            onError={(message) => onUploadError(message)}
          />
        ) : (
          ''
        )}
        {value && Object.keys(value).length ? (
          <div className="lzb-gutenberg-image">
            <DropZone
              onFilesDrop={(files) => {
                mediaUpload({
                  allowedTypes: ALLOWED_MEDIA_TYPES,
                  filesList: files,
                  onFileChange: (image) => {
                    onChange(image[0]);
                  },
                  onError: (message) => {
                    noticeOperations.createErrorNotice(message);
                  },
                });
              }}
            />
            <div className="lzb-gutenberg-image-button">
              <Button
                isSecondary
                isSmall
                onClick={() => {
                  onChange('');
                }}
              >
                {__('Remove Image', 'lazy-blocks')}
              </Button>
            </div>
            <div className="lzb-gutenberg-image-item" key={value.id || value.url}>
              {imagePreviewData.url ? (
                <img src={imagePreviewData.url} alt={imagePreviewData.alt} />
              ) : (
                ''
              )}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </BaseControl>
  );
}

export default withNotices(ImageControl);
