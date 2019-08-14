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

        return (
            <TextControl
                label={ __( 'Default value' ) }
                help={ __( 'Appears when inserting a new block' ) }
                value={ data.default }
                onChange={ ( value ) => updateData( { default: value } ) }
            />
        );
    }
}
