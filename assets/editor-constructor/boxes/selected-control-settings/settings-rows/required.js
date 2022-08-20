const { __ } = wp.i18n;

const { PanelBody, BaseControl, ToggleControl } = wp.components;

export default function RequiredRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <BaseControl label={__('Required', 'lazy-blocks')}>
        <ToggleControl
          label={__('Yes', 'lazy-blocks')}
          help={__('Experimental feature, may not work as expected.', 'lazy-blocks')}
          checked={'true' === data.required}
          onChange={(value) => updateData({ required: value ? 'true' : 'false' })}
        />
      </BaseControl>
    </PanelBody>
  );
}
