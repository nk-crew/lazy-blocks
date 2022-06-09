const { __ } = wp.i18n;

const { PanelBody, TextareaControl } = wp.components;

export default function HelpRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <TextareaControl
        label={__('Help text', '@@text_domain')}
        help={__('Instructions under control', '@@text_domain')}
        value={data.help}
        onChange={(value) => updateData({ help: value })}
      />
    </PanelBody>
  );
}
