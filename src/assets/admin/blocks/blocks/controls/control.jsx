/* eslint-disable camelcase */
import classnames from 'classnames';

const { __, _n, sprintf } = wp.i18n;
const { Component, Fragment } = wp.element;

const { compose } = wp.compose;

const {
    withDispatch,
    withSelect,
} = wp.data;

class Control extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            collapsedChilds: false,
        };

        this.toggleCollapseChilds = this.toggleCollapseChilds.bind( this );
    }

    toggleCollapseChilds() {
        this.setState( { collapsedChilds: ! this.state.collapsedChilds } );
    }

    render() {
        const {
            selectControl,
            printControls,
            data,
            id,
            controls,
            DragHandle,
            isSelected,
        } = this.props;

        const {
            label = '',
            name = '',
            placement = 'content',
            save_in_meta = 'false',
            save_in_meta_name = '',
            type = '',
        } = data;

        let placementLabel = __( 'Content' );
        switch ( placement ) {
        case 'inspector':
            placementLabel = __( 'Inspector' );
            break;
        case 'both':
            placementLabel = __( 'Both' );
            break;
        case 'nowhere':
            placementLabel = __( 'Hidden' );
            break;
        }

        const {
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
            <div className={ classnames( 'lzb-constructor-controls-item-wrap', isSelected ? 'lzb-constructor-controls-item-wrap-selected' : '' ) }>
                <div
                    className="lzb-constructor-controls-item"
                    onClick={ () => {
                        selectControl( id );
                    } }
                    role="none"
                >
                    <div className="lzb-constructor-controls-item-head">
                        <div className="lzb-constructor-controls-item-label">
                            <span>{ label }</span>
                            <small>{ name }</small>
                        </div>
                        <div className="lzb-constructor-controls-item-type">
                            <div>{ type }</div>
                        </div>
                        <div className="lzb-constructor-controls-item-placement">
                            { data.child_of ? '' : placementLabel }
                        </div>
                        <div className="lzb-constructor-controls-item-meta">
                            { ! data.child_of && 'true' === save_in_meta ? save_in_meta_name : '' }
                            { ! data.child_of && 'false' === save_in_meta ? '-' : '' }
                        </div>
                        <DragHandle />
                    </div>
                    { type === 'repeater' ? (
                        <button
                            className="lzb-constructor-controls-item-repeater-toggle"
                            onClick={ ( e ) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.toggleCollapseChilds();
                            } }
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

export default compose( [
    withSelect( ( select, ownProps ) => {
        const {
            getSelectedControlId,
        } = select( 'lazy-blocks/block-data' );

        return {
            isSelected: ownProps.id === getSelectedControlId(),
        };
    } ),
    withDispatch( ( dispatch ) => {
        const {
            selectControl,
        } = dispatch( 'lazy-blocks/block-data' );

        return {
            selectControl,
        };
    } ),
] )( Control );
