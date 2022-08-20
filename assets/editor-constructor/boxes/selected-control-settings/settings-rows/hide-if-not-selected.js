const { __ } = wp.i18n;

const { PanelBody, BaseControl, ToggleControl } = wp.components;

export default function HideIfNotSelectedRow(props) {
  const { updateData, data } = props;

  return (
    <PanelBody>
      <BaseControl label={__('Hide if block is not selected', 'lazy-blocks')}>
        <ToggleControl
          label={__('Yes', 'lazy-blocks')}
          checked={'true' === data.hide_if_not_selected}
          onChange={(value) => updateData({ hide_if_not_selected: value ? 'true' : 'false' })}
        />
      </BaseControl>
    </PanelBody>
  );
}
