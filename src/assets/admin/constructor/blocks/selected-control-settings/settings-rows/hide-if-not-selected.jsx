const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
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
            <PanelBody>
                <BaseControl
                    label={ __( 'Hide if block is not selected', '@@text_domain' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes', '@@text_domain' ) }
                        checked={ 'true' === data.hide_if_not_selected }
                        onChange={ ( value ) => updateData( { hide_if_not_selected: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
        );
    }
}
