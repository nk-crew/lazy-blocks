import SettingsRows from './settings-rows';
import './editor.scss';

const { __ } = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const {
    PanelBody,
    Button,
} = wp.components;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
} = wp.data;

class SelectedControlSettings extends Component {
    render() {
        const {
            id,
            data,
            updateControlData,
            removeControl,
        } = this.props;

        return (
            <div className="lzb-constructor-controls-item-settings">
                { id && data ? (
                    <Fragment>
                        <SettingsRows
                            updateData={ ( newData, optionalId = false ) => {
                                updateControlData( optionalId || id, newData );
                            } }
                            data={ data }
                        />
                        <PanelBody
                            title={ __( 'Remove Control', '@@text_domain' ) }
                            initialOpen={ false }
                        >
                            <Button
                                isDefault={ true }
                                onClick={ () => {
                                    removeControl();
                                } }
                            >
                                { __( 'Remove', '@@text_domain' ) }
                            </Button>
                        </PanelBody>
                    </Fragment>
                ) : (
                    __( 'Select control to see settings.', '@@text_domain' )
                ) }
            </div>
        );
    }
}

export default compose( [
    withSelect( ( select ) => {
        const {
            getSelectedControlId,
            getSelectedControl,
        } = select( 'lazy-blocks/block-data' );

        return {
            id: getSelectedControlId(),
            data: getSelectedControl(),
        };
    } ),
    withDispatch( ( dispatch, ownProps ) => {
        const {
            removeControl,
            updateControlData,
        } = dispatch( 'lazy-blocks/block-data' );

        return {
            removeControl() {
                if ( ownProps.id ) {
                    removeControl( ownProps.id );
                }
            },
            updateControlData,
        };
    } ),
] )( SelectedControlSettings );
