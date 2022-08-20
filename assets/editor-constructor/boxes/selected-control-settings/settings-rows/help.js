const { __ } = wp.i18n;

const { PanelBody, TextareaControl } = wp.components;

export default function HelpRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <TextareaControl
        label={__('Help text', 'lazy-blocks')}
        help={__('Instructions under control', 'lazy-blocks')}
        value={data.help}
        onChange={(value) => updateData({ help: value })}
      />
    </PanelBody>
  );
}
