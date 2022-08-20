import slugify from 'slugify';

import getControlTypeData from '../../../../utils/get-control-type-data';

const { __ } = wp.i18n;

const { PanelBody, TextControl } = wp.components;

export default function LabelRow(props) {
  const { updateData, data } = props;

  function generateUniqueName() {
    const { label = '', name = '' } = data;

    if (!label || name) {
      return;
    }

    updateData({
      name: slugify(label, {
        replacement: '-',
        lower: true,
        remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
      }),
    });
  }

  const { label = '' } = data;

  const controlTypeData = getControlTypeData(data.type);
  const allowNameUpdate = controlTypeData.restrictions.name_settings;

  return (
    <PanelBody>
      <TextControl
        label={__('Label', 'lazy-blocks')}
        help={__('This is the name which will appear on the block edit control', 'lazy-blocks')}
        value={label}
        onChange={(value) => updateData({ label: value })}
        onBlur={allowNameUpdate ? generateUniqueName : () => {}}
        autoFocus
      />
    </PanelBody>
  );
}
