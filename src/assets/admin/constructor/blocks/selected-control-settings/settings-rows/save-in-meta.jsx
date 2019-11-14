const { __ } = wp.i18n;

const { Component, Fragment } = wp.element;

const {
    PanelBody,
    BaseControl,
    CheckboxControl,
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
                        label={ __( 'Save in meta' ) }
                    >
                        <CheckboxControl
                            label={ __( 'Yes' ) }
                            checked={ 'true' === data.save_in_meta }
                            onChange={ ( value ) => updateData( { save_in_meta: value ? 'true' : 'false' } ) }
                        />
                    </BaseControl>
                </PanelBody>
                { 'true' === data.save_in_meta ? (
                    <PanelBody>
                        <TextControl
                            label={ __( 'Meta custom name (optional)' ) }
                            value={ data.save_in_meta_name }
                            onChange={ ( value ) => updateData( { save_in_meta_name: value } ) }
                            placeholder={ data.name || __( 'Unique metabox name' ) }
                        />
                    </PanelBody>
                ) : '' }
            </Fragment>
        );
    }
}
