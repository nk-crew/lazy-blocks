import BaseControl from '../../assets/components/base-control';

const { __ } = wp.i18n;

const { Button, DropZone, withNotices } = wp.components;

const { MediaPlaceholder, MediaUpload } = wp.blockEditor;

const { useSelect } = wp.data;

const ALLOWED_MEDIA_TYPES = ['image'];

function GalleryControl(props) {
  const {
    label,
    value,
    previewSize,
    help,
    noticeOperations,
    noticeUI,
    onChange = () => {},
  } = props;

  const { mediaUpload, imagesPreviewData } = useSelect((select) => {
    const { getMedia } = select('core');

    const preview = {};

    if (value && Object.keys(value).length) {
      value.forEach((img) => {
        if (!preview[img.id]) {
          const mediaImg = getMedia(img.id) || false;

          if (mediaImg) {
            preview[img.id] = {
              alt: mediaImg.alt_text,
              url: mediaImg.source_url,
            };

            if (
              mediaImg.media_details &&
              mediaImg.media_details.sizes &&
              mediaImg.media_details.sizes[previewSize]
            ) {
              preview[img.id].url = mediaImg.media_details.sizes[previewSize].source_url;
            }
          }
        }
      });
    }

    return {
      mediaUpload: select('core/block-editor').getSettings().mediaUpload,
      imagesPreviewData: preview,
    };
  });

  function onUploadError(message) {
    noticeOperations.removeAllNotices();
    noticeOperations.createErrorNotice(message);
  }

  return (
    <BaseControl label={label} help={help}>
      <div className="lzb-gutenberg-gallery-wrap">
        {!value || !Object.keys(value).length ? (
          <MediaPlaceholder
            icon="format-gallery"
            labels={{
              title: label,
              name: __('images', 'lazy-blocks'),
            }}
            onSelect={(images) => {
              onChange(images);
            }}
            notices={noticeUI}
            accept="image/*"
            allowedTypes={ALLOWED_MEDIA_TYPES}
            disableMaxUploadErrorMessages
            multiple
            onError={(message) => onUploadError(message)}
          />
        ) : (
          ''
        )}
        {value && Object.keys(value).length ? (
          <MediaUpload
            onSelect={(images) => {
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
                        onChange(currentImages.concat(images));
                      },
                      onError: (message) => {
                        noticeOperations.createErrorNotice(message);
                      },
                    });
                  }}
                />
                <div className="lzb-gutenberg-gallery-button">
                  <Button isSecondary isSmall>
                    {__('Edit Gallery', 'lazy-blocks')}
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

export default withNotices(GalleryControl);
