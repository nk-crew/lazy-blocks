/* eslint-disable camelcase */
import classnames from 'classnames';

const { __ } = wp.i18n;
const { Component } = wp.element;

const { compose } = wp.compose;

const {
    applyFilters,
} = wp.hooks;

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
            data,
            id,
            DragHandle,
            isSelected,
        } = this.props;

        const {
            label,
            name,
            placement,
            save_in_meta,
            save_in_meta_name,
            type,
            required,
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

        // Item with filter
        let controlsItem = applyFilters( `lzb.constructor.controls.${ type }.item`, (
            <div
                className="lzb-constructor-controls-item"
                onClick={ () => {
                    selectControl( id );
                } }
                role="none"
            >
                <div className="lzb-constructor-controls-item-head">
                    <div className="lzb-constructor-controls-item-label">
                        <span>
                            { label }
                            { 'true' === required ? (
                                <span className="required">*</span>
                            ) : '' }
                        </span>
                        <small>{ name }</small>
                    </div>
                    <div className="lzb-constructor-controls-item-type">
                        <div>{ type }</div>
                    </div>
                    <div className="lzb-constructor-controls-item-placement">
                        { data.child_of ? '' : placementLabel }
                    </div>
                    <div className="lzb-constructor-controls-item-meta">
                        { ! data.child_of && 'true' === save_in_meta ? ( save_in_meta_name || name ) : '' }
                        { ! data.child_of && 'false' === save_in_meta ? '-' : '' }
                    </div>
                    <DragHandle />
                </div>
            </div>
        ), this.props );

        controlsItem = applyFilters( 'lzb.constructor.controls.item', controlsItem, this.props );

        return (
            <div className={ classnames( 'lzb-constructor-controls-item-wrap', isSelected ? 'lzb-constructor-controls-item-wrap-selected' : '' ) }>
                { controlsItem }
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
