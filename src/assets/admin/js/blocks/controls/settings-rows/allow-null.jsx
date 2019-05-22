const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    CheckboxControl,
} = wp.components;

export default class AllowNullRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Allow Null' ) }</span>
                    <small>{ __( 'Will be added option that allow you to reset selected option value to null' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.allow_null }
                        onChange={ ( value ) => updateData( { allow_null: value ? 'true' : 'false' } ) }
                    />
                </div>
            </div>
        );
    }
}
