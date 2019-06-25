import Select from '../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    CheckboxControl,
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
                <div className="lzb-constructor-grid">
                    <div>
                        <BaseControl
                            label={ __( 'Multiple' ) }
                        >
                            <CheckboxControl
                                label={ __( 'Yes' ) }
                                checked={ supportsMultiple }
                                onChange={ ( value ) => updateData( { supports_multiple: value } ) }
                            />
                        </BaseControl>
                    </div>
                    <div>
                        <BaseControl
                            label={ __( 'ClassName' ) }
                        >
                            <CheckboxControl
                                label={ __( 'Yes' ) }
                                checked={ supportsClassname }
                                onChange={ ( value ) => updateData( { supports_classname: value } ) }
                            />
                        </BaseControl>
                    </div>
                </div>
                <div className="lzb-constructor-grid">
                    <div>
                        <BaseControl
                            label={ __( 'Anchor' ) }
                        >
                            <CheckboxControl
                                label={ __( 'Yes' ) }
                                checked={ supportsAnchor }
                                onChange={ ( value ) => updateData( { supports_anchor: value } ) }
                            />
                        </BaseControl>
                    </div>
                    <div>
                        <BaseControl
                            label={ __( 'Inserter' ) }
                        >
                            <CheckboxControl
                                label={ __( 'Yes' ) }
                                checked={ supportsInserter }
                                onChange={ ( value ) => updateData( { supports_inserter: value } ) }
                            />
                        </BaseControl>
                    </div>
                </div>
                <div className="lzb-constructor-grid">
                    <div>
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
                    </div>
                    <div>
                    </div>
                </div>
            </Fragment>
        );
    }
}
