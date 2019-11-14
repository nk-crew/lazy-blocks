const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
    TextareaControl,
} = wp.components;

export default class HelpRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <PanelBody>
                <TextareaControl
                    label={ __( 'Help text' ) }
                    help={ __( 'Instructions under control' ) }
                    value={ data.help }
                    onChange={ ( value ) => updateData( { help: value } ) }
                />
            </PanelBody>
        );
    }
}
