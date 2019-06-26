const { __ } = wp.i18n;

const {
    Component,
} = wp.element;

const {
    TextControl,
} = wp.components;

export default class NameRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            name = '',
        } = data;

        return (
            <TextControl
                label={ __( 'Name' ) }
                help={ __( 'Unique control name, no spaces. Underscores and dashes allowed' ) }
                value={ name }
                onChange={ ( value ) => updateData( { name: value } ) }
            />
        );
    }
}
