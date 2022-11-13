const { __ } = wp.i18n;

const { Button, DropZone, withNotices } = wp.components;

const { MediaPlaceholder } = wp.blockEditor;

const { useSelect } = wp.data;

const { allowed_mime_types: wpAllowedMimeTypes } =
  window.lazyblocksConstructorData || window.lazyblocksGutenberg;

function FileControl(props) {
  const { label, value, allowedMimeTypes, noticeOperations, noticeUI, onChange = () => {} } = props;

  const { mediaUpload } = useSelect((select) => ({
    mediaUpload: select('core/block-editor').getSettings().mediaUpload,
  }));

  function onUploadError(message) {
    noticeOperations.removeAllNotices();
    noticeOperations.createErrorNotice(message);
  }

  const ALLOWED_MEDIA_TYPES = [];

  // If selected specific media types.
  if (allowedMimeTypes && allowedMimeTypes.length) {
    allowedMimeTypes.forEach((typeName) => {
      if (wpAllowedMimeTypes[typeName]) {
        ALLOWED_MEDIA_TYPES.push(wpAllowedMimeTypes[typeName]);
      }
    });

    // If nothing selected - all types allowed.
  } else {
    Object.keys(wpAllowedMimeTypes).forEach((typeName) => {
      ALLOWED_MEDIA_TYPES.push(wpAllowedMimeTypes[typeName]);
    });
  }

  return (
    <div className="lzb-gutenberg-file-wrap">
      {!value || !Object.keys(value).length ? (
        <MediaPlaceholder
          icon="media-default"
          labels={{
            title: label,
            name: __('file', 'lazy-blocks'),
          }}
          onSelect={(file) => {
            onChange(file);
          }}
          notices={noticeUI}
          // Looks like we can't just use the ALLOWED_MEDIA_TYPES,
          // since it is not complete. https://wordpress.org/support/topic/file-note-respecting-allowed-mime-types/
          // accept={ ALLOWED_MEDIA_TYPES }
          allowedTypes={ALLOWED_MEDIA_TYPES}
          disableMaxUploadErrorMessages
          onError={(message) => onUploadError(message)}
        />
      ) : (
        ''
      )}
      {value && Object.keys(value).length ? (
        <div className="lzb-gutenberg-file">
          <DropZone
            onFilesDrop={(files) => {
              mediaUpload({
                allowedTypes: ALLOWED_MEDIA_TYPES,
                filesList: files,
                onFileChange: (file) => {
                  onChange(file[0]);
                },
                onError: (message) => {
                  noticeOperations.createErrorNotice(message);
                },
              });
            }}
          />
          <div className="lzb-gutenberg-file-item" key={value.id || value.url}>
            <div className="lzb-gutenberg-file-item-icon">
              <span className="dashicons dashicons-media-default" />
            </div>
            <div className="lzb-gutenberg-file-item-content">
              <div className="lzb-gutenberg-file-item-content-title">{value.title}</div>
              <div className="lzb-gutenberg-file-item-content-filename">
                {value.url.replace(/^.*[\\/]/, '')}
              </div>
            </div>
          </div>
          <div className="lzb-gutenberg-file-button">
            <Button
              isSecondary
              isSmall
              onClick={() => {
                onChange('');
              }}
            >
              {__('Remove File', 'lazy-blocks')}
            </Button>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

export default withNotices(FileControl);
