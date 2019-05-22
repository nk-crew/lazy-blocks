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
                        <CheckboxControl
                            label={ __( 'Multiple' ) }
                            help={ __( 'Allow use block multiple times on the page.' ) }
                            checked={ supportsMultiple }
                            onChange={ ( value ) => updateData( { supports_multiple: value } ) }
                        />
                    </div>
                    <div>
                        <CheckboxControl
                            label={ __( 'Class Name' ) }
                            help={ __( 'Additional field to add custom class name.' ) }
                            checked={ supportsClassname }
                            onChange={ ( value ) => updateData( { supports_classname: value } ) }
                        />
                    </div>
                </div>
                <div className="lzb-constructor-grid">
                    <div>
                        <CheckboxControl
                            label={ __( 'Anchor' ) }
                            help={ __( 'Additional field to add block ID attribute.' ) }
                            checked={ supportsAnchor }
                            onChange={ ( value ) => updateData( { supports_anchor: value } ) }
                        />
                    </div>
                    <div>
                        <CheckboxControl
                            label={ __( 'Inserter' ) }
                            help={ __( 'Show block in blocks inserter.' ) }
                            checked={ supportsInserter }
                            onChange={ ( value ) => updateData( { supports_inserter: value } ) }
                        />
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
                                        const result = supportsAlign.map( ( val ) => {
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

                                    value.forEach( ( optionData ) => {
                                        result.push( optionData.value );
                                    } );

                                    updateData( { supports_align: result } );
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
