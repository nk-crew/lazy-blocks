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
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Default value' ) }</span>
                    <small>{ __( 'Appears when inserting a new block' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <TextControl
                        value={ data.default }
                        onChange={ ( value ) => updateData( { default: value } ) }
                    />
                </div>
            </div>
        );
    }
}
