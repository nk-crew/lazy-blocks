const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class CheckedRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Checked' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.checked }
                    onChange={ ( value ) => updateData( { checked: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        );
    }
}
