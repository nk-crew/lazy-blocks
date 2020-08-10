import getControlTypeData from '../../../../utils/get-control-type-data';

const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    PanelBody,
    BaseControl,
    ButtonGroup,
    Button,
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

        const controlTypeData = getControlTypeData( data.type );

        // check restrictions.
        let placementRestrictions = [];

        if ( controlTypeData && 'undefined' !== typeof controlTypeData.restrictions.placement_settings ) {
            placementRestrictions = controlTypeData.restrictions.placement_settings;
        }

        if ( ! placementRestrictions.length ) {
            return '';
        }

        return (
            <PanelBody>
                <BaseControl
                    label={ __( 'Placement', '@@text_domain' ) }
                >
                    <div />
                    <ButtonGroup>
                        <Button
                            isPrimary={ 'content' === placement || 'both' === placement }
                            isPressed={ 'content' === placement || 'both' === placement }
                            disabled={ -1 === placementRestrictions.indexOf( 'content' ) }
                            isSmall
                            onClick={ () => {
                                let newPlacement = 'content';

                                if ( 'both' === placement ) {
                                    newPlacement = 'inspector';
                                } else if ( 'content' === placement ) {
                                    newPlacement = 'nowhere';
                                } else if ( 'inspector' === placement ) {
                                    newPlacement = 'both';
                                }

                                updateData( {
                                    placement: newPlacement,
                                } );
                            } }
                        >
                            { __( 'Content', '@@text_domain' ) }
                        </Button>
                        <Button
                            isPrimary={ 'inspector' === placement || 'both' === placement }
                            isPressed={ 'inspector' === placement || 'both' === placement }
                            disabled={ -1 === placementRestrictions.indexOf( 'inspector' ) }
                            isSmall
                            onClick={ () => {
                                let newPlacement = 'inspector';

                                if ( 'both' === placement ) {
                                    newPlacement = 'content';
                                } else if ( 'inspector' === placement ) {
                                    newPlacement = 'nowhere';
                                } else if ( 'content' === placement ) {
                                    newPlacement = 'both';
                                }

                                updateData( {
                                    placement: newPlacement,
                                } );
                            } }
                        >
                            { __( 'Inspector', '@@text_domain' ) }
                        </Button>
                    </ButtonGroup>
                </BaseControl>
            </PanelBody>
        );
    }
}
