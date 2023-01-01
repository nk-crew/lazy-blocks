/* eslint-disable no-param-reassign */
/* eslint-disable indent */
import BaseControl from '../../assets/components/base-control';

import ImageControl from './image-control';

const { addFilter } = wp.hooks;

const { __ } = wp.i18n;

const { useSelect } = wp.data;

const { PanelBody, SelectControl } = wp.components;

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.image.render', 'lzb.editor', (render, props) => (
  <BaseControl label={props.data.label} help={props.data.help}>
    <ImageControl
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
  </BaseControl>
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
function AdditionalAttributes(props) {
  const { updateData, data } = props;

  const { imageSizes, imageDimensions } = useSelect((select) => {
    const { getSettings } = select('core/block-editor');
    const editorSettings = getSettings();

    return {
      imageSizes: editorSettings.imageSizes || [
        {
          name: __('Medium', 'lazy-blocks'),
          slug: 'medium',
        },
      ],
      imageDimensions: editorSettings.imageDimensions || {
        medium: {
          width: 300,
          height: 300,
        },
      },
    };
  });

  return (
    <PanelBody>
      <SelectControl
        label={__('Preview Size', 'lazy-blocks')}
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

addFilter('lzb.constructor.control.image.settings', 'lzb.constructor', (render, props) => (
  <AdditionalAttributes {...props} />
));
