import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
} = wp.components;

const {
    allowed_mime_types: wpAllowedMimeTypes,
} = window.lazyblocks_localize;

export default class AllowedMimeTypesRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const options = Object.keys( wpAllowedMimeTypes ).map( ( typeName ) => {
            return {
                label: typeName,
                value: typeName,
            };
        } );

        return (
            <BaseControl
                label={ __( 'Allowed Mime Types' ) }
                help={ __( 'If nothing selected, all file types will be allowed to use.' ) }
            >
                <Select
                    isMulti={ true }
                    options={ options }
                    value={ ( () => {
                        if ( data.allowed_mime_types && Array.isArray( data.allowed_mime_types ) ) {
                            const result = data.allowed_mime_types.map( ( val ) => {
                                return {
                                    value: val,
                                    label: val,
                                };
                            } );
                            return result;
                        }
                        return [];
                    } )() }
                    onChange={ ( value ) => {
                        const result = [];

                        if ( value ) {
                            value.forEach( ( optionData ) => {
                                result.push( optionData.value );
                            } );
                        }

                        updateData( { allowed_mime_types: result } );
                    } }
                />
            </BaseControl>
        );
    }
}
