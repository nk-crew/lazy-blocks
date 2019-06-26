const { __ } = wp.i18n;
const { Component } = wp.element;
const {
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
            <BaseControl
                label={ __( 'Save in meta' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.save_in_meta }
                    onChange={ ( value ) => updateData( { save_in_meta: value ? 'true' : 'false' } ) }
                />
                { 'true' === data.save_in_meta ? (
                    <TextControl
                        value={ data.save_in_meta_name }
                        onChange={ ( value ) => updateData( { save_in_meta_name: value } ) }
                        placeholder={ __( 'Unique metabox name' ) }
                    />
                ) : '' }
            </BaseControl>
        );
    }
}
