const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class AllowNullRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Allow Null' ) }
                help={ __( 'Allows you to reset selected option value to null' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.allow_null }
                    onChange={ ( value ) => updateData( { allow_null: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        );
    }
}
