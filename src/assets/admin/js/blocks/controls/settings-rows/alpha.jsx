const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    CheckboxControl,
} = wp.components;

export default class AlphaRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Alpha Channel' ) }</span>
                    <small>{ __( 'Will be added option that allow you to set semi-transparent colors with rgba' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.alpha }
                        onChange={ ( value ) => updateData( { alpha: value ? 'true' : 'false' } ) }
                    />
                </div>
            </div>
        );
    }
}
