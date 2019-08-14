const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    CheckboxControl,
} = wp.components;

export default class MultilineRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <CheckboxControl
                label={ __( 'Multiline' ) }
                checked={ 'true' === data.multiline }
                onChange={ ( value ) => updateData( { multiline: value ? 'true' : 'false' } ) }
            />
        );
    }
}
