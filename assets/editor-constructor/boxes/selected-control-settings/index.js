import SettingsRows from './settings-rows';
import './editor.scss';

const { __ } = wp.i18n;

const { PanelBody } = wp.components;

const { useSelect, useDispatch } = wp.data;

export default function SelectedControlSettings() {
  const { id, data } = useSelect((select) => {
    const { getSelectedControlId, getSelectedControl } = select('lazy-blocks/block-data');

    return {
      id: getSelectedControlId(),
      data: getSelectedControl(),
    };
  }, []);

  const { updateControlData } = useDispatch('lazy-blocks/block-data');

  return (
    <div className="lzb-constructor-controls-item-settings">
      {id && data ? (
        <SettingsRows
          updateData={(newData, optionalId = false) => {
            updateControlData(optionalId || id, newData);
          }}
          data={data}
          id={id}
        />
      ) : (
        <PanelBody>{__('Select control to see settings.', 'lazy-blocks')}</PanelBody>
      )}
    </div>
  );
}
