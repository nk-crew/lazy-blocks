const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    TextControl,
} = wp.components;

export default class MinMaxStepRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Min, Max, Step' ) }</span>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <TextControl
                        type="number"
                        placeholder={ __( 'Min' ) }
                        step={ data.step }
                        value={ data.min }
                        onChange={ ( value ) => updateData( { min: value } ) }
                    />
                    <TextControl
                        type="number"
                        placeholder={ __( 'Max' ) }
                        step={ data.step }
                        value={ data.max }
                        onChange={ ( value ) => updateData( { max: value } ) }
                    />
                    <TextControl
                        type="number"
                        placeholder={ __( 'Step' ) }
                        value={ data.step }
                        onChange={ ( value ) => updateData( { step: value } ) }
                    />
                </div>
            </div>
        );
    }
}
