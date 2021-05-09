const { __ } = wp.i18n;

const { Component, Fragment } = wp.element;

const {
    PanelBody,
    BaseControl,
    Button,
    ToggleControl,
    TextControl,
} = wp.components;

export default class SaveInMetaRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <Fragment>
                <PanelBody>
                    <BaseControl
                        label={ __( 'Save in Meta', '@@text_domain' ) }
                        help={ (
                            <Button
                                isSecondary
                                isSmall
                                href="https://lazyblocks.com/documentation/examples/display-custom-fields-meta/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={ { marginTop: '10px' } }
                            >
                                { __( 'How to use?', '@@text_domain' ) }
                            </Button>
                        ) }
                    >
                        <ToggleControl
                            label={ __( 'Yes', '@@text_domain' ) }
                            checked={ 'true' === data.save_in_meta }
                            onChange={ ( value ) => updateData( { save_in_meta: value ? 'true' : 'false' } ) }
                        />
                    </BaseControl>
                    { 'true' === data.save_in_meta ? (
                        <TextControl
                            label={ __( 'Meta custom name (optional)', '@@text_domain' ) }
                            value={ data.save_in_meta_name }
                            onChange={ ( value ) => updateData( { save_in_meta_name: value } ) }
                            placeholder={ data.name || __( 'Unique metabox name', '@@text_domain' ) }
                        />
                    ) : '' }
                </PanelBody>
            </Fragment>
        );
    }
}
