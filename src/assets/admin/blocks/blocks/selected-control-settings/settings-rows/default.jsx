const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    TextControl,
} = wp.components;

export default class DefaultRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        let maxlength = '';

        if (
            data.characters_limit && (
                data.type === 'text' ||
                data.type === 'textarea' ||
                data.type === 'email' ||
                data.type === 'password'
            )
        ) {
            maxlength = parseInt( data.characters_limit );
        }

        return (
            <TextControl
                label={ __( 'Default value' ) }
                help={ __( 'Appears when inserting a new block' ) }
                value={ data.default }
                onChange={ ( value ) => updateData( { default: value } ) }
                maxlength={ maxlength }
            />
        );
    }
}
