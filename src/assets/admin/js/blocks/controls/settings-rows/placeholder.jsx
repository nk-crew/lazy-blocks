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
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Placeholder' ) }</span>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <TextControl
                        value={ placeholder }
                        onChange={ ( value ) => updateData( { placeholder: value } ) }
                    />
                </div>
            </div>
        );
    }
}
