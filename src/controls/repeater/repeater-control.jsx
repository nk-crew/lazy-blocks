import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    Button,
    Tooltip,
    ToggleControl,
} = wp.components;

const {
    withInstanceId,
} = wp.compose;

const DragHandle = SortableHandle( () => (
    <Button
        className="lzb-gutenberg-repeater-btn-drag"
        onClick={ ( e ) => {
            e.stopPropagation();
        } }
        role="button"
    >
        <span className="dashicons dashicons-menu" />
    </Button>
) );

const SortableItem = SortableElement( ( data ) => (
    <div className="lzb-gutenberg-repeater-item">
        { /* eslint-disable-next-line react/button-has-type */ }
        <button
            className={ `lzb-gutenberg-repeater-btn${ data.active ? ' lzb-gutenberg-repeater-btn-active' : '' }` }
            onClick={ data.onToggle }
        >
            { data.title }
            <DragHandle />
            <span className="lzb-gutenberg-repeater-btn-arrow dashicons dashicons-arrow-right-alt2" />
        </button>
        { ! data.controlData.rows_min || data.count > data.controlData.rows_min ? (
            // eslint-disable-next-line react/button-has-type
            <button
                className="lzb-gutenberg-repeater-btn-remove"
                onClick={ data.onRemove }
            >
                <span className="dashicons dashicons-no-alt" />
            </button>
        ) : '' }
        { data.active ? data.renderContent() : '' }
    </div>
) );
const SortableList = SortableContainer( ( { items } ) => (
    <div className="lzb-gutenberg-repeater-items">
        { items.map( ( value, index ) => (
            // eslint-disable-next-line react/no-array-index-key
            <SortableItem key={ `repeater-item-${ index }` } index={ index } { ...value } />
        ) ) }
    </div>
) );

class RepeaterControl extends Component {
    constructor( ...args ) {
        super( ...args );

        const {
            controlData,
        } = this.props;

        this.sortRef = wp.element.createRef();

        let activeItem = -1;

        if ( 'false' === controlData.rows_collapsible ) {
            activeItem = -2;
        } else if ( 'false' === controlData.rows_collapsed ) {
            activeItem = -2;
        }

        this.state = {
            activeItem,
        };

        this.getRowTitle = this.getRowTitle.bind( this );
    }

    componentDidMount() {
        const {
            count = 0,
            controlData,
            addRow = () => {},
        } = this.props;

        // add rows to meet Minimum requirements
        if ( controlData.rows_min && 0 < controlData.rows_min && controlData.rows_min > count ) {
            const needToAdd = controlData.rows_min - count;

            for ( let i = 0; i < needToAdd; i += 1 ) {
                addRow();
            }
        }
    }

    getRowTitle( i ) {
        const {
            controlData,
            getInnerControls = () => {},
        } = this.props;

        let title = controlData.rows_label || __( 'Row {{#}}', '@@text_domain' );

        // add row number.
        title = title.replace( /{{#}}/g, i + 1 );

        const innerControls = getInnerControls( i );

        // add inner controls values.
        if ( innerControls ) {
            Object.keys( innerControls ).forEach( ( k ) => {
                const val = innerControls[ k ].val || '';
                const { data } = innerControls[ k ];

                title = title.replace( new RegExp( `{{${ data.name }}}`, 'g' ), val );
            } );
        }

        return title;
    }

    render() {
        const {
            label,
            count = 0,
            controlData,
            renderRow = () => {},
            addRow = () => {},
            removeRow = () => {},
            resortRow = () => {},
        } = this.props;

        const items = [];
        for ( let i = 0; i < count; i += 1 ) {
            const active = -2 === this.state.activeItem || this.state.activeItem === i;

            items.push( {
                title: this.getRowTitle( i ),
                active,
                count,
                controlData,
                onToggle: ( e ) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if ( 'true' === controlData.rows_collapsible ) {
                        this.setState( { activeItem: active ? -1 : i } );
                    }
                },
                onRemove: ( e ) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeRow( i );
                },
                renderContent: () => (
                    <div className="lzb-gutenberg-repeater-item-content">
                        { renderRow( i ) }
                    </div>
                ),
            } );
        }

        return (
            <BaseControl label={ label }>
                <div className="lzb-gutenberg-repeater">
                    { items.length ? (
                        <SortableList
                            ref={ this.sortRef }
                            items={ items }
                            onSortEnd={ ( { oldIndex, newIndex } ) => {
                                resortRow( oldIndex, newIndex );

                                if ( -1 < this.state.activeItem ) {
                                    this.setState( { activeItem: newIndex } );
                                }
                            } }
                            useDragHandle
                            helperContainer={ () => {
                                if ( this.sortRef && this.sortRef.current && this.sortRef.current.container ) {
                                    return this.sortRef.current.container;
                                }

                                return document.body;
                            } }
                        />
                    ) : '' }
                    <div className="lzb-gutenberg-repeater-options">
                        <Button
                            isSecondary
                            isSmall
                            disabled={ controlData.rows_max && count >= controlData.rows_max }
                            onClick={ () => {
                                addRow();
                            } }
                        >
                            { controlData.rows_add_button_label || __( '+ Add Row', '@@text_domain' ) }
                        </Button>
                        { 'true' === controlData.rows_collapsible && items.length && 1 < items.length ? (
                            <Tooltip text={ __( 'Toggle all rows', '@@text_domain' ) }>
                                <div>
                                    { /* For some reason Tooltip is not working without this <div> */ }
                                    <ToggleControl
                                        checked={ -2 === this.state.activeItem }
                                        onChange={ () => {
                                            this.setState( ( prevState ) => ( { activeItem: prevState.activeItem ? -1 : -2 } ) );
                                        } }
                                    />
                                </div>
                            </Tooltip>
                        ) : '' }
                    </div>
                </div>
            </BaseControl>
        );
    }
}

export default withInstanceId( RepeaterControl );
