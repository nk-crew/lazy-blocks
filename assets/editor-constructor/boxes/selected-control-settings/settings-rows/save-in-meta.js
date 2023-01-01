const { __ } = wp.i18n;

const { PanelBody, BaseControl, Button, ToggleControl, TextControl } = wp.components;

const { plugin_version: pluginVersion } = window.lazyblocksConstructorData;

export default function SaveInMetaRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <BaseControl
        label={__('Save in Meta', 'lazy-blocks')}
        help={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Button
            isSecondary
            isSmall
            href={`https://www.lazyblocks.com/docs/examples/display-custom-fields-meta/?utm_source=plugin&utm_medium=constructor&utm_campaign=how_to_use_meta&utm_content=${pluginVersion}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: '10px' }}
          >
            {__('How to use?', 'lazy-blocks')}
          </Button>
        }
      >
        <ToggleControl
          label={__('Yes', 'lazy-blocks')}
          checked={data.save_in_meta === 'true'}
          onChange={(value) => updateData({ save_in_meta: value ? 'true' : 'false' })}
        />
      </BaseControl>
      {data.save_in_meta === 'true' ? (
        <TextControl
          label={__('Meta custom name (optional)', 'lazy-blocks')}
          value={data.save_in_meta_name}
          onChange={(value) => updateData({ save_in_meta_name: value })}
          placeholder={data.name || __('Unique metabox name', 'lazy-blocks')}
        />
      ) : (
        ''
      )}
    </PanelBody>
  );
}
