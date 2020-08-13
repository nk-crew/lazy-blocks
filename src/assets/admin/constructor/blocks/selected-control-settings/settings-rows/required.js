const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
    BaseControl,
    CheckboxControl,
} = wp.components;

export default class RequiredRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <PanelBody>
                <BaseControl
                    label={ __( 'Required', '@@text_domain' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes', '@@text_domain' ) }
                        help={ __( 'Experimental feature, may not work as expected.', '@@text_domain' ) }
                        checked={ 'true' === data.required }
                        onChange={ ( value ) => updateData( { required: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
        );
    }
}
