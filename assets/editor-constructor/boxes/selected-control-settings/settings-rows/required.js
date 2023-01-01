const { __ } = wp.i18n;

const { PanelBody, BaseControl, ToggleControl } = wp.components;

export default function RequiredRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <BaseControl label={__('Required', 'lazy-blocks')}>
        <ToggleControl
          label={__('Yes', 'lazy-blocks')}
          checked={data.required === 'true'}
          onChange={(value) => updateData({ required: value ? 'true' : 'false' })}
        />
      </BaseControl>
    </PanelBody>
  );
}
