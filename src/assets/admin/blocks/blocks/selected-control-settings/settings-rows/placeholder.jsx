const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    TextControl,
} = wp.components;

export default class PlaceholderRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            placeholder = '',
        } = data;

        return (
            <TextControl
                label={ __( 'Placeholder' ) }
                value={ placeholder }
                onChange={ ( value ) => updateData( { placeholder: value } ) }
            />
        );
    }
}
