const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class HideIfNotSelectedRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Hide if block is not selected' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.hide_if_not_selected }
                    onChange={ ( value ) => updateData( { hide_if_not_selected: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        );
    }
}
