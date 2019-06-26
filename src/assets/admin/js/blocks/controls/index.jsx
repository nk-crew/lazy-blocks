import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import './editor.scss';
import Control from './control';

const { __ } = wp.i18n;
const {
    Component,
    Fragment,
    createRef,
} = wp.element;

const { compose } = wp.compose;

const {
    withDispatch,
    dispatch,
} = wp.data;

const DragHandle = SortableHandle( () => (
    <div className="lzb-constructor-controls-item-handler">
        <span className="dashicons dashicons-menu" />
    </div>
) );

const SortableItem = SortableElement( ( data ) =>
    <Control
        { ...{
            ...data,
            ...{
                DragHandle,
            },
        } }
    />
);
const SortableList = SortableContainer( ( { items } ) => {
    return (
        <div className="lzb-constructor-controls-items-sortable">
            { items.map( ( value, index ) => (
                <SortableItem key={ `lzb-constructor-controls-items-sortable-${ value.id }` } index={ index } { ...value } />
            ) ) }
        </div>
    );
} );

class ControlsSettings extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            postTypes: false,
            collapsedId: '',
        };

        this.sortRef = createRef();

        this.printControls = this.printControls.bind( this );
    }

    printControls( childOf = '' ) {
        const self = this;
        const {
            data,
            addControl,
            removeControl,
            resortControl,
            updateControlData,
        } = self.props;

        const {
            controls = {},
        } = data;

        const items = [];

        Object.keys( controls ).forEach( ( id ) => {
            const controlData = controls[ id ];
            const collapsed = self.state.collapsedId === id;

            if ( childOf !== controlData.child_of ) {
                return '';
            }

            items.push( {
                addControl( newControlData ) {
                    addControl( newControlData );
                },
                removeControl( optionalId = false ) {
                    removeControl( optionalId || id );
                },
                updateData( newData, optionalId = false ) {
                    updateControlData( optionalId || id, newData );
                },
                printControls: self.printControls,
                data: controlData,
                id,
                controls,
                collapsed,
            } );
        } );

        return (
            <Fragment>
                <SortableList
                    ref={ self.sortRef }
                    items={ items }
                    onSortEnd={ ( { oldIndex, newIndex } ) => {
                        resortControl( items[ oldIndex ].id, items[ newIndex ].id );
                    } }
                    useDragHandle={ true }
                    helperContainer={ function() {
                        if ( self.sortRef && self.sortRef.current && self.sortRef.current.container ) {
                            return self.sortRef.current.container;
                        }

                        // sometimes container ref disappears, so we can find dom element manually.
                        const newRef = document.querySelector( '.lzb-constructor' ) || document.body;

                        return newRef;
                    } }
                />
                <button
                    className="lzb-constructor-controls-item-appender"
                    onClick={ () => {
                        addControl( { child_of: childOf } );
                    } }
                >
                    { childOf ? __( '+ Add Child Control' ) : __( '+ Add Control' ) }
                </button>
            </Fragment>
        );
    }

    render() {
        const self = this;

        return (
            <div className="lzb-constructor-controls">
                <div className="lzb-constructor-controls-columns">
                    <div>{ __( 'Name' ) }</div>
                    <div>{ __( 'Type' ) }</div>
                    <div>{ __( 'Placement' ) }</div>
                    <div>{ __( 'Meta' ) }</div>
                </div>
                { self.printControls( '' ) }
            </div>
        );
    }
}

export default compose( [
    withDispatch( () => {
        const {
            addControl,
            removeControl,
            resortControl,
            updateControlData,
        } = dispatch( 'lazy-blocks/block-data' );

        return {
            addControl,
            removeControl,
            resortControl,
            updateControlData,
        };
    } ),
] )( ControlsSettings );
