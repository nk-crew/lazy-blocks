const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class AlphaRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Alpha Channel' ) }
                help={ __( 'Will be added option that allow you to set semi-transparent colors with rgba' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.alpha }
                    onChange={ ( value ) => updateData( { alpha: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        );
    }
}
