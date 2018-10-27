import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    Button,
} = wp.components;

const {
    withInstanceId,
} = wp.compose;

const DragHandle = SortableHandle( () => (
    <div
        className="lzb-gutenberg-repeater-btn-drag"
        onClick={ ( e ) => {
            e.stopPropagation();
        } }
        role="button"
    >
        <span className="dashicons dashicons-menu"></span>
    </div>
) );

const SortableItem = SortableElement( ( data ) =>
    <div className="lzb-gutenberg-repeater-item">
        <button
            className={ 'lzb-gutenberg-repeater-btn' + ( data.active ? ' lzb-gutenberg-repeater-btn-active' : '' ) }
            onClick={ data.onToggle }
        >
            { data.title }
            <DragHandle />
            <span className="lzb-gutenberg-repeater-btn-arrow dashicons dashicons-arrow-right-alt2" />
        </button>
        <button className="lzb-gutenberg-repeater-btn-remove" onClick={ data.onRemove }><span className="dashicons dashicons-no-alt" /></button>
        { data.active ? data.renderContent() : '' }
    </div>
);
const SortableList = SortableContainer( ( { items } ) => {
    return (
        <div className="lzb-gutenberg-repeater-items">
            { items.map( ( value, index ) => (
                <SortableItem key={ `repeater-item-${ index }` } index={ index } { ...value } />
            ) ) }
        </div>
    );
} );

class RepeaterControl extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            activeItem: -1,
        };
    }
    render() {
        const {
            label,
            count = 1,
            renderRow = () => {},
            addRow = () => {},
            removeRow = () => {},
            resortRow = () => {},
        } = this.props;

        const items = [];
        for ( let i = 0; i < count; i++ ) {
            const active = this.state.activeItem === i;

            items.push( {
                title: `Row ${ i + 1 }`,
                active: active,
                onToggle: ( e ) => {
                    e.preventDefault();
                    e.stopPropagation();

                    this.setState( { activeItem: active ? -1 : i } );
                },
                onRemove: ( e ) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeRow( i );
                },
                renderContent: () => {
                    return (
                        <div className="lzb-gutenberg-repeater-item-content">
                            { renderRow( i ) }
                        </div>
                    );
                },
            } );
        }

        return (
            <BaseControl label={ label }>
                <div className="lzb-gutenberg-repeater">
                    { items.length && items.length > 0 ? (
                        <SortableList
                            items={ items }
                            onSortEnd={ ( { oldIndex, newIndex } ) => {
                                resortRow( oldIndex, newIndex );

                                if ( this.state.activeItem > -1 ) {
                                    this.setState( { activeItem: newIndex } );
                                }
                            } }
                            useDragHandle={ true }
                            helperClass={ 'lzb-gutenberg-repeater-sortable' }
                        />
                    ) : '' }
                    <Button
                        isDefault={ true }
                        onClick={ () => {
                            addRow();
                        } }
                    >
                        { __( '+ Add Row' ) }
                    </Button>
                </div>
            </BaseControl>
        );
    }
}

export default withInstanceId( RepeaterControl );
