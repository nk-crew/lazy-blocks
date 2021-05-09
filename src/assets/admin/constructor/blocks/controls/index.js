import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import classnames from 'classnames/dedupe';

import './editor.scss';
import Control from './control';

const { __ } = wp.i18n;

const {
    Component,
    Fragment,
    createRef,
} = wp.element;

const {
    Tooltip,
    TabPanel,
} = wp.components;

const { compose } = wp.compose;

const {
    withDispatch,
    dispatch,
} = wp.data;

const $ = window.jQuery;

const constructorData = window.lazyblocksConstructorData;

const DragHandle = SortableHandle( () => (
    <span className="lzb-constructor-controls-item-handler">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4.99976H8V6.99976H10V4.99976Z" fill="currentColor" />
            <path d="M10 10.9998H8V12.9998H10V10.9998Z" fill="currentColor" />
            <path d="M10 16.9998H8V18.9998H10V16.9998Z" fill="currentColor" />
            <path d="M16 4.99976H14V6.99976H16V4.99976Z" fill="currentColor" />
            <path d="M16 10.9998H14V12.9998H16V10.9998Z" fill="currentColor" />
            <path d="M16 16.9998H14V18.9998H16V16.9998Z" fill="currentColor" />
        </svg>
    </span>
) );

const SortableItem = SortableElement( ( data ) => (
    <Control
        { ...{
            ...data,
            ...{
                DragHandle,
            },
        } }
    />
) );
const SortableList = SortableContainer( ( { items } ) => (
    <div className="lzb-constructor-controls-items-sortable">
        { items.map( ( value, index ) => (
            <SortableItem
                key={ `lzb-constructor-controls-items-sortable-${ value.id }` }
                index={ index }
                { ...value }
            />
        ) ) }
    </div>
) );

let initialActiveTab = '';

class ControlsSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            // eslint-disable-next-line react/no-unused-state
            placement: 'content',
            // eslint-disable-next-line react/no-unused-state
            collapsedId: '',
        };

        this.sortRef = createRef();

        this.printControls = this.printControls.bind( this );
    }

    componentDidMount() {
        // fix first loading focus on code editor
        $( '.lazyblocks-control-tabs button:eq(0)' ).focus();
    }

    printControls( childOf = '', placement = '' ) {
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
            const controlPlacement = controlData.placement || 'content';

            if ( childOf !== controlData.child_of ) {
                return;
            }

            if ( ! controlData.child_of && placement !== controlPlacement && 'both' !== controlPlacement ) {
                return;
            }

            items.push( {
                addControl( newControlData, resortId ) {
                    addControl( newControlData, resortId );
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
                    useDragHandle
                    helperClass="lzb-constructor-controls-item-dragging"
                    helperContainer={ () => {
                        if ( self.sortRef && self.sortRef.current && self.sortRef.current.container ) {
                            return self.sortRef.current.container;
                        }

                        // sometimes container ref disappears, so we can find dom element manually.
                        const newRef = document.querySelector( '.lzb-constructor' ) || document.body;

                        return newRef;
                    } }
                />
                <Tooltip text={ childOf ? __( 'Add Child Control', '@@text_domain' ) : __( 'Add Control', '@@text_domain' ) }>
                    { /* eslint-disable-next-line react/button-has-type */ }
                    <button
                        className="lzb-constructor-controls-item-appender"
                        onClick={ () => {
                            addControl( {
                                placement: placement || 'content',
                                child_of: childOf,
                            } );
                        } }
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" /></svg>
                    </button>
                </Tooltip>
            </Fragment>
        );
    }

    render() {
        const self = this;
        const {
            data,
        } = self.props;

        const {
            controls = {},
        } = data;

        const placementTabs = [
            {
                name: 'content',
                title: (
                    <Fragment>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <rect x="7" y="7" width="8" height="10" rx="0.5" fill="currentColor" />
                        </svg>
                        { __( 'Content Controls', '@@text_domain' ) }
                    </Fragment>
                ),
                className: 'lazyblocks-control-tabs-tab',
            }, {
                name: 'inspector',
                title: (
                    <Fragment>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <rect x="13" y="7" width="4" height="10" rx="0.5" fill="currentColor" />
                        </svg>
                        { __( 'Inspector Controls', '@@text_domain' ) }
                    </Fragment>
                ),
                className: 'lazyblocks-control-tabs-tab',
            },
        ];

        // Check if there is hidden controls
        let thereIsHidden = false;

        Object.keys( controls ).forEach( ( id ) => {
            const controlData = controls[ id ];

            if ( ! controlData.child_of && 'nowhere' === controlData.placement ) {
                thereIsHidden = true;
            }
        } );

        placementTabs.push( {
            name: 'nowhere',
            title: __( 'Hidden', '@@text_domain' ),
            className: classnames( 'lazyblocks-control-tabs-tab', ! thereIsHidden ? 'lazyblocks-control-tabs-tab-hidden' : '' ),
        } );

        // set initial active tab.
        if ( ! initialActiveTab ) {
            initialActiveTab = 'content';
            let contentControlsCount = 0;
            let inspectorControlsCount = 0;
            let nowhereControlsCount = 0;

            Object.keys( controls ).forEach( ( id ) => {
                const controlData = controls[ id ];

                switch ( controlData.placement ) {
                case 'content':
                    contentControlsCount += 1;
                    break;
                case 'inspector':
                    inspectorControlsCount += 1;
                    break;
                case 'nowhere':
                    nowhereControlsCount += 1;
                    break;
                // no default
                }
            } );

            if ( ! contentControlsCount ) {
                if ( inspectorControlsCount ) {
                    initialActiveTab = 'inspector';
                } else if ( nowhereControlsCount ) {
                    initialActiveTab = 'nowhere';
                }
            }
        }

        return (
            <div className="lzb-constructor-controls">
                <TabPanel
                    className="lazyblocks-control-tabs"
                    activeClass="is-active"
                    initialTabName={ initialActiveTab }
                    tabs={ placementTabs }
                >
                    {
                        ( tab ) => self.printControls( '', tab.name )
                    }
                </TabPanel>
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
            addControl( attributes, resortId ) {
                addControl( {
                    ...constructorData.controls.text.attributes,
                    ...attributes,
                }, resortId );
            },
            removeControl,
            resortControl,
            updateControlData,
        };
    } ),
] )( ControlsSettings );
