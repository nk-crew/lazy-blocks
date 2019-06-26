const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class MultipleRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Multiple' ) }
                help={ __( 'Allows you to select multiple values' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.multiple }
                    onChange={ ( value ) => updateData( { multiple: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        );
    }
}
