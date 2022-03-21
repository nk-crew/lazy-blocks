const { __ } = wp.i18n;

const { PanelBody, TextControl } = wp.components;

export default function NameRow(props) {
  const { updateData, data } = props;

  const { name = '' } = data;

  return (
    <PanelBody>
      <TextControl
        label={__('Name', '@@text_domain')}
        help={__('Unique control name, no spaces. Underscores and dashes allowed', '@@text_domain')}
        value={name}
        onChange={(value) => updateData({ name: value })}
      />
    </PanelBody>
  );
}
