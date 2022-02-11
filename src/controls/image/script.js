/* eslint-disable no-param-reassign */
/* eslint-disable indent */
import ImageControl from './image-control';

const { addFilter } = wp.hooks;

const { __ } = wp.i18n;

const { Component } = wp.element;

const { PanelBody, SelectControl } = wp.components;

const { withInstanceId, compose } = wp.compose;

const { withSelect } = wp.data;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.image.render', 'lzb.editor', (render, props) => (
  <ImageControl
    label={props.data.label}
    help={props.data.help}
    previewSize={props.data.preview_size}
    value={props.getValue()}
    onChange={(val) => {
      const result = val
        ? {
            alt: val.alt || '',
            title: val.title || '',
            caption: val.caption || '',
            description: val.description || '',
            id: val.id || '',
            link: val.link || '',
            url: val.url || '',
            sizes: val.sizes || '',
          }
        : '';

      props.onChange(result);
    }}
  />
));

/**
 * getValue filter in editor.
 */
addFilter('lzb.editor.control.image.getValue', 'lzb.editor', (value) => {
  // change string value to array.
  if (typeof value === 'string') {
    try {
      value = JSON.parse(decodeURI(value));
    } catch (e) {
      value = [];
    }
  }

  return value;
});

/**
 * updateValue filter in editor.
 */
addFilter('lzb.editor.control.image.updateValue', 'lzb.editor', (value) => {
  // change array value to string.
  if (typeof value === 'object' || Array.isArray(value)) {
    value = encodeURI(JSON.stringify(value));
  }

  return value;
});

/**
 * Control settings render in constructor.
 */
class AdditionalAttributes extends Component {
  render() {
    const { imageSizes, imageDimensions, updateData, data } = this.props;

    return (
      <PanelBody>
        <SelectControl
          label={__('Preview Size', '@@text_domain')}
          options={imageSizes.map((sizeData) => {
            let sizeLabel = sizeData.name;

            if (imageDimensions[sizeData.slug]) {
              sizeLabel += ` (${imageDimensions[sizeData.slug].width} × ${
                imageDimensions[sizeData.slug].height
              })`;
            }

            return {
              label: sizeLabel,
              value: sizeData.slug,
            };
          })}
          value={data.preview_size || 'medium'}
          onChange={(value) => updateData({ preview_size: value })}
        />
      </PanelBody>
    );
  }
}

const AdditionalAttributesWithSelect = compose([
  withInstanceId,
  withSelect((select) => {
    const { getSettings } = select('core/block-editor');

    const editorSettings = getSettings();
    const imageSizes = editorSettings.imageSizes || [
      {
        name: __('Medium', '@@text_domain'),
        slug: 'medium',
      },
    ];
    const imageDimensions = editorSettings.imageDimensions || {
      medium: {
        width: 300,
        height: 300,
      },
    };

    return {
      imageSizes,
      imageDimensions,
    };
  }),
])(AdditionalAttributes);

addFilter('lzb.constructor.control.image.settings', 'lzb.constructor', (render, props) => (
  <AdditionalAttributesWithSelect {...props} />
));
