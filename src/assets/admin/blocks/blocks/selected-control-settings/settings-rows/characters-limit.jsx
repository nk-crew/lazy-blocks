const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    TextControl,
} = wp.components;

export default class CharactersLimitRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <BaseControl
                label={ __( 'Characters Limit' ) }
                help={ __( 'Maximum number of characters allowed. Leave blank to no limit.' ) }
            >
                <TextControl
                    value={ data.characters_limit ? parseInt( data.characters_limit, 10 ) : '' }
                    type="number"
                    min={ 0 }
                    max={ 524288 }
                    onChange={ ( value ) => updateData( { characters_limit: `${ value }` } ) }
                />
            </BaseControl>
        );
    }
}
