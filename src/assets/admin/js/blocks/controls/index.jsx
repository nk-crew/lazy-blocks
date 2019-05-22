import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import './editor.scss';
import Control from './control';
import getUID from '../../utils/get-uid';
import controlsDefaults from './defaults';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;

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

export default class ControlsSettings extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            postTypes: false,
            collapsedId: '',
        };

        this.sortRef = wp.element.createRef();

        this.addControl = this.addControl.bind( this );
        this.removeControl = this.removeControl.bind( this );
        this.updateControlData = this.updateControlData.bind( this );
        this.printControls = this.printControls.bind( this );
    }

    addControl( newControlData ) {
        const {
            data,
            updateData,
        } = this.props;
        const {
            controls = {},
        } = data;

        let newId = getUID();
        while ( typeof controls[ `control_${ newId }` ] !== 'undefined' ) {
            newId = getUID();
        }
        newId = `control_${ newId }`;

        data.controls[ newId ] = {
            ...controlsDefaults,
            ...newControlData,
        };

        this.setState( {
            collapsedId: newId,
        } );

        updateData( data );
    }

    removeControl( id ) {
        const {
            data,
            updateData,
        } = this.props;

        delete data.controls[ id ];

        updateData( data );
    }

    resortControl( oldKey, newKey ) {
        if ( oldKey === newKey ) {
            return;
        }

        const {
            data,
            updateData,
        } = this.props;

        const newControls = {};
        let insertBefore = true;

        if ( data.controls ) {
            Object.keys( data.controls ).forEach( ( key ) => {
                if ( key !== oldKey ) {
                    if ( insertBefore && key === newKey ) {
                        newControls[ oldKey ] = data.controls[ oldKey ];
                    }

                    newControls[ key ] = data.controls[ key ];

                    if ( ! insertBefore && key === newKey ) {
                        newControls[ oldKey ] = data.controls[ oldKey ];
                    }
                } else {
                    insertBefore = false;
                }
            } );

            data.controls = newControls;

            updateData( data );
        }
    }

    updateControlData( id, controlData ) {
        const {
            data,
            updateData,
        } = this.props;

        data.controls[ id ] = {
            ...data.controls[ id ],
            ...controlData,
        };

        updateData( data );
    }

    printControls( childOf = '' ) {
        const self = this;
        const {
            data,
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
                    self.addControl( newControlData );
                },
                removeControl( optionalId = false ) {
                    self.removeControl( optionalId || id );
                },
                updateData( newData, optionalId = false ) {
                    self.updateControlData( optionalId || id, newData );
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
                { items.length ? (
                    <SortableList
                        ref={ self.sortRef }
                        items={ items }
                        onSortEnd={ ( { oldIndex, newIndex } ) => {
                            self.resortControl( items[ oldIndex ].id, items[ newIndex ].id );
                        } }
                        useDragHandle={ true }
                        helperContainer={ () => {
                            if ( self.sortRef && self.sortRef.current && self.sortRef.current.container ) {
                                return self.sortRef.current.container;
                            }

                            return document.body;
                        } }
                    />
                ) : '' }
                <button
                    className="lzb-constructor-controls-item-appender"
                    onClick={ () => {
                        self.addControl( { child_of: childOf } );
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
