import Select from '../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    ToggleControl,
} = wp.components;

export default class SupportsSettings extends Component {
    render() {
        const {
            data,
            updateData,
        } = this.props;

        const {
            supports_multiple: supportsMultiple,
            supports_classname: supportsClassname,
            supports_anchor: supportsAnchor,
            supports_inserter: supportsInserter,
            supports_align: supportsAlign,
        } = data;

        return (
            <Fragment>
                <ToggleControl
                    label={ __( 'Multiple' ) }
                    help={ __( 'Allow use block multiple times on the page.' ) }
                    checked={ supportsMultiple }
                    onChange={ ( value ) => updateData( { supports_multiple: value } ) }
                />
                <ToggleControl
                    label={ __( 'Class Name' ) }
                    help={ __( 'Additional field to add custom class name.' ) }
                    checked={ supportsClassname }
                    onChange={ ( value ) => updateData( { supports_classname: value } ) }
                />
                <ToggleControl
                    label={ __( 'Anchor' ) }
                    help={ __( 'Additional field to add block ID attribute.' ) }
                    checked={ supportsAnchor }
                    onChange={ ( value ) => updateData( { supports_anchor: value } ) }
                />
                <ToggleControl
                    label={ __( 'Inserter' ) }
                    help={ __( 'Show block in blocks inserter.' ) }
                    checked={ supportsInserter }
                    onChange={ ( value ) => updateData( { supports_inserter: value } ) }
                />
                <BaseControl
                    label={ __( 'Align' ) }
                >
                    <Select
                        isMulti
                        placeholder={ __( 'Select align options' ) }
                        options={
                            [ 'wide', 'full', 'left', 'center', 'right' ].map( ( alignName ) => {
                                return {
                                    value: alignName,
                                    label: alignName,
                                };
                            } )
                        }
                        value={ ( () => {
                            if ( supportsAlign && supportsAlign.length ) {
                                const result = supportsAlign
                                    .filter( ( val ) => {
                                        return val !== 'none';
                                    } )
                                    .map( ( val ) => {
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
                            if ( value ) {
                                const result = [];

                                value.forEach( ( optionData ) => {
                                    result.push( optionData.value );
                                } );

                                updateData( { supports_align: result } );
                            } else {
                                updateData( { supports_align: [ 'none' ] } );
                            }
                        } }
                    />
                </BaseControl>
            </Fragment>
        );
    }
}
