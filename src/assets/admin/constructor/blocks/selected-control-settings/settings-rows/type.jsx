import Select from '../../../../components/select';
import getControlTypeData from '../../../../utils/get-control-type-data';

const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
    BaseControl,
} = wp.components;

const {
    withSelect,
} = wp.data;

const {
    controls,
} = window.lazyblocksConstructorData;

class TypeRow extends Component {
    render() {
        const {
            updateData,
            blockData,
            data,
        } = this.props;

        const {
            type = '',
        } = data;

        const types = Object.keys( controls ).map( ( k ) => {
            const controlTypeData = getControlTypeData( controls[ k ].name );
            let isDisabled = false;

            // restrictions.
            if ( ! isDisabled && controlTypeData ) {
                // restrict as child.
                if ( ! controlTypeData.restrictions.as_child ) {
                    isDisabled = data.child_of;
                }

                // restrict once per block.
                if ( ! isDisabled && controlTypeData.restrictions.once && blockData && blockData.controls ) {
                    Object.keys( blockData.controls ).forEach( ( i ) => {
                        if ( controlTypeData.name === blockData.controls[ i ].type ) {
                            isDisabled = true;
                        }
                    } );
                }
            }

            return {
                value: controls[ k ].name,
                label: controls[ k ].label,
                group: controls[ k ].category,
                isDisabled,
            };
        } );

        // prepare options list to react-select.
        const groupedTypes = {};
        const reactSelectTypes = [];

        types.forEach( ( option ) => {
            if ( option.group ) {
                groupedTypes[ option.group ] = {
                    label: option.group,
                    options: [
                        ...( groupedTypes[ option.group ] && groupedTypes[ option.group ].options ? groupedTypes[ option.group ].options : [] ),
                        ...[ option ],
                    ],
                };
            } else {
                reactSelectTypes.push( option );
            }
        } );

        Object.keys( groupedTypes ).forEach( ( k ) => {
            reactSelectTypes.push( groupedTypes[ k ] );
        } );

        return (
            <PanelBody>
                <BaseControl
                    label={ __( 'Type' ) }
                >
                    <Select
                        value={ types.filter( option => option.value === type ) }
                        options={ reactSelectTypes }
                        onChange={ ( { value } ) => updateData( { type: value } ) }
                    />
                </BaseControl>
            </PanelBody>
        );
    }
}

export default withSelect( ( select ) => {
    const {
        getBlockData,
    } = select( 'lazy-blocks/block-data' );

    return {
        blockData: getBlockData(),
    };
} )( TypeRow );
