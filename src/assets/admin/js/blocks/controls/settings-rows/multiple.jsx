const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    CheckboxControl,
} = wp.components;

export default class MultipleRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Multiple' ) }</span>
                    <small>{ __( 'Allows you to select multiple values' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.multiple }
                        onChange={ ( value ) => updateData( { multiple: value ? 'true' : 'false' } ) }
                    />
                </div>
            </div>
        );
    }
}
