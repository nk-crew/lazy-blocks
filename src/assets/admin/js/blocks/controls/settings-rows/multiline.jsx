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
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <CheckboxControl
                        label={ __( 'Multiline' ) }
                        checked={ 'true' === data.multiline }
                        onChange={ ( value ) => updateData( { multiline: value ? 'true' : 'false' } ) }
                    />
                </div>
            </div>
        );
    }
}
