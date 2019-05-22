const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    TextareaControl,
} = wp.components;

export default class HelpRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Help text' ) }</span>
                    <small>{ __( 'Instructions under control' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <TextareaControl
                        value={ data.help }
                        onChange={ ( value ) => updateData( { help: value } ) }
                    />
                </div>
            </div>
        );
    }
}
