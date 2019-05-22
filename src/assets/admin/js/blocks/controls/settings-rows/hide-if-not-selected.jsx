const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    CheckboxControl,
} = wp.components;

export default class HideIfNotSelectedRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Hide if block is not selected' ) }</span>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.hide_if_not_selected }
                        onChange={ ( value ) => updateData( { hide_if_not_selected: value ? 'true' : 'false' } ) }
                    />
                </div>
            </div>
        );
    }
}
