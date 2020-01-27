import Select from '../../../../components/select';
import getControlTypeData from '../../../../utils/get-control-type-data';

const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
    BaseControl,
} = wp.components;

export default class PlacementRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            placement = 'content',
        } = data;

        const options = [];

        const controlTypeData = getControlTypeData( data.type );

        // check restrictions.
        if ( controlTypeData && typeof controlTypeData.restrictions.placement_settings !== 'undefined' ) {
            controlTypeData.restrictions.placement_settings.forEach( ( thisPlacement ) => {
                switch ( thisPlacement ) {
                case 'content':
                    options.push( {
                        value: thisPlacement,
                        label: __( 'Content', '@@text_domain' ),
                    } );
                    break;
                case 'inspector':
                    options.push( {
                        value: thisPlacement,
                        label: __( 'Inspector', '@@text_domain' ),
                    } );
                    break;
                default:
                    options.push( {
                        value: thisPlacement,
                        label: thisPlacement,
                    } );
                    break;
                }
            } );
        }

        if ( options.length > 1 ) {
            options.push( {
                value: 'both',
                label: __( 'Both', '@@text_domain' ),
            } );
        }

        if ( options.length ) {
            options.push( {
                value: 'nowhere',
                label: __( 'Hidden', '@@text_domain' ),
            } );
        }

        // no options.
        if ( ! options.length ) {
            return '';
        }

        return (
            <PanelBody>
                <BaseControl
                    label={ __( 'Placement', '@@text_domain' ) }
                >
                    <Select
                        value={ options.filter( option => option.value === placement ) }
                        options={ options }
                        onChange={ ( { value } ) => updateData( { placement: value } ) }
                    />
                </BaseControl>
            </PanelBody>
        );
    }
}
