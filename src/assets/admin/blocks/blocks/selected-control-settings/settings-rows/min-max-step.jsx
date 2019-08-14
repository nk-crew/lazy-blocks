const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    TextControl,
} = wp.components;

export default class MinMaxStepRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Min, Max, Step' ) }
            >
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
            </BaseControl>
        );
    }
}
