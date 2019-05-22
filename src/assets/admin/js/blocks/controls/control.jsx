/* eslint-disable camelcase */
import SettingsRows from './settings-rows';

const { __, _n, sprintf } = wp.i18n;
const { Component, Fragment } = wp.element;

export default class Control extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            collapsed: this.props.collapsed || false,
            collapsedChilds: false,
        };

        this.toggleCollapse = this.toggleCollapse.bind( this );
        this.toggleCollapseChilds = this.toggleCollapseChilds.bind( this );
    }

    toggleCollapse() {
        this.setState( { collapsed: ! this.state.collapsed } );
    }

    toggleCollapseChilds() {
        this.setState( { collapsedChilds: ! this.state.collapsedChilds } );
    }

    render() {
        const {
            removeControl,
            updateData,
            printControls,
            data,
            id,
            controls,
            DragHandle,
        } = this.props;

        const {
            label = '',
            name = '',
            placement = 'content',
            save_in_meta = 'false',
            save_in_meta_name = '',
            type = '',
        } = data;

        const {
            collapsed,
            collapsedChilds,
        } = this.state;

        // repeater child items count.
        let childItemsNum = 0;
        if ( type === 'repeater' ) {
            Object.keys( controls ).forEach( ( thisId ) => {
                const controlData = controls[ thisId ];

                if ( controlData.child_of === id ) {
                    childItemsNum++;
                }
            } );
        }

        return (
            <div className="lzb-constructor-controls-item-wrap">
                <div className="lzb-constructor-controls-item">
                    <div className="lzb-constructor-controls-item-head">
                        <div className="lzb-constructor-controls-item-label">
                            <span>{ label }</span>
                            <small>{ name }</small>
                        </div>
                        <div className="lzb-constructor-controls-item-type">
                            <div>{ type }</div>
                            <div className="lzb-constructor-controls-item-actions">
                                <button
                                    className="lzb-constructor-controls-item-actions-collapse"
                                    onClick={ this.toggleCollapse }
                                >
                                    { collapsed ? __( 'Collapse' ) : __( 'Expand' ) }
                                </button>
                                <button
                                    className="lzb-constructor-controls-item-actions-delete"
                                    onClick={ () => removeControl() }
                                >
                                    { __( 'Delete' ) }
                                </button>
                            </div>
                        </div>
                        <div className="lzb-constructor-controls-item-placement">
                            { data.child_of ? '' : placement }
                        </div>
                        <div className="lzb-constructor-controls-item-meta">
                            { ! data.child_of && 'true' === save_in_meta ? save_in_meta_name : '' }
                            { ! data.child_of && 'false' === save_in_meta ? '-' : '' }
                        </div>
                        <DragHandle />
                    </div>
                    { collapsed ? (
                        <div className="lzb-constructor-controls-item-settings">
                            <SettingsRows
                                { ...{ updateData, data } }
                            />
                        </div>
                    ) : '' }
                    { type === 'repeater' ? (
                        <button
                            className="lzb-constructor-controls-item-repeater-toggle"
                            onClick={ this.toggleCollapseChilds }
                        >
                            { collapsedChilds ? (
                                <Fragment>
                                    { __( 'Hide child items' ) }
                                </Fragment>
                            ) : (
                                <Fragment>
                                    { childItemsNum ? (
                                        sprintf( _n( 'Show %d child item', 'Show %d child items', childItemsNum ), childItemsNum )
                                    ) : (
                                        __( 'Add child items' )
                                    ) }
                                </Fragment>
                            ) }
                        </button>
                    ) : '' }
                </div>
                { type === 'repeater' && ! collapsedChilds ? (
                    <button
                        className="lzb-constructor-controls-item-repeater-decoration"
                        onClick={ this.toggleCollapseChilds }
                    />
                ) : '' }
                { type === 'repeater' && collapsedChilds ? (
                    <div className="lzb-constructor-controls-item-childs">
                        { printControls( id ) }
                    </div>
                ) : '' }
            </div>
        );
    }
}
