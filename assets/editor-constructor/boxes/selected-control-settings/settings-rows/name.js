const { __ } = wp.i18n;

const { PanelBody, TextControl } = wp.components;

export default function NameRow(props) {
  const { updateData, data } = props;

  const { name = '' } = data;

  return (
    <PanelBody>
      <TextControl
        label={__('Name', 'lazy-blocks')}
        help={__('Unique control name, no spaces. Underscores and dashes allowed', 'lazy-blocks')}
        value={name}
        onChange={(value) => updateData({ name: value })}
      />
    </PanelBody>
  );
}
