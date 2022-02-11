const { __ } = wp.i18n;

const { Component } = wp.element;

const { PanelBody, BaseControl, Button, ToggleControl, TextControl } = wp.components;

export default class SaveInMetaRow extends Component {
  render() {
    const { updateData, data } = this.props;

    return (
      <PanelBody>
        <BaseControl
          label={__('Save in Meta', '@@text_domain')}
          help={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <Button
              isSecondary
              isSmall
              href="https://lazyblocks.com/documentation/examples/display-custom-fields-meta/?utm_source=plugin&utm_medium=constructor&utm_campaign=how_to_use_meta&utm_content=@@plugin_version"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: '10px' }}
            >
              {__('How to use?', '@@text_domain')}
            </Button>
          }
        >
          <ToggleControl
            label={__('Yes', '@@text_domain')}
            checked={data.save_in_meta === 'true'}
            onChange={(value) => updateData({ save_in_meta: value ? 'true' : 'false' })}
          />
        </BaseControl>
        {data.save_in_meta === 'true' ? (
          <TextControl
            label={__('Meta custom name (optional)', '@@text_domain')}
            value={data.save_in_meta_name}
            onChange={(value) => updateData({ save_in_meta_name: value })}
            placeholder={data.name || __('Unique metabox name', '@@text_domain')}
          />
        ) : (
          ''
        )}
      </PanelBody>
    );
  }
}
