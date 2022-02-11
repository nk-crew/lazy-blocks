import SettingsRows from './settings-rows';
import './editor.scss';

const { __ } = wp.i18n;

const { Component } = wp.element;

const { compose } = wp.compose;

const { PanelBody } = wp.components;

const { withSelect, withDispatch } = wp.data;

class SelectedControlSettings extends Component {
  render() {
    const { id, data, updateControlData } = this.props;

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
          <PanelBody>{__('Select control to see settings.', '@@text_domain')}</PanelBody>
        )}
      </div>
    );
  }
}

export default compose([
  withSelect((select) => {
    const { getSelectedControlId, getSelectedControl } = select('lazy-blocks/block-data');

    return {
      id: getSelectedControlId(),
      data: getSelectedControl(),
    };
  }),
  withDispatch((dispatch) => {
    const { updateControlData } = dispatch('lazy-blocks/block-data');

    return {
      updateControlData,
    };
  }),
])(SelectedControlSettings);
