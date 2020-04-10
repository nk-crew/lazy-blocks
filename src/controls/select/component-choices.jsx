import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';

const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    TextControl,
    Button,
} = wp.components;

const DragHandle = SortableHandle( () => (
    <div className="lzb-constructor-controls-item-settings-choices-item-handler">
        <span className="dashicons dashicons-menu" />
    </div>
) );

const SortableItem = SortableElement( ( data ) =>
    <div className="lzb-constructor-controls-item-settings-choices-item">
        <TextControl
            placeholder={ __( 'Label', '@@text_domain' ) }
            value={ data.label }
            onChange={ ( value ) => data.updateChoice( { label: value } ) }
        />
        <TextControl
            placeholder={ __( 'Value', '@@text_domain' ) }
            value={ data.value }
            onChange={ ( value ) => data.updateChoice( { value: value } ) }
        />
        <DragHandle />
        <button
            className="lzb-constructor-controls-item-settings-choices-item-remove"
            onClick={ () => data.removeChoice() }
        >
            <span className="dashicons dashicons-minus" />
        </button>
    </div>
);
const SortableList = SortableContainer( ( { items } ) => {
    return (
        <div className="lzb-constructor-controls-item-settings-choices-items">
            { items.map( ( value, index ) => (
                <SortableItem key={ `lzb-constructor-controls-item-settings-choices-item-${ index }` } index={ index } { ...value } />
            ) ) }
        </div>
    );
} );

export default class ChoicesRow extends Component {
    constructor() {
        super( ...arguments );

        this.sortRef = wp.element.createRef();

        this.addChoice = this.addChoice.bind( this );
        this.removeChoice = this.removeChoice.bind( this );
        this.updateChoice = this.updateChoice.bind( this );
    }

    addChoice() {
        const {
            data,
            updateData,
        } = this.props;
        const {
            choices = [],
        } = data;

        choices.push( {
            label: '',
            value: '',
        } );

        updateData( { choices } );
    }

    removeChoice( i ) {
        const {
            data,
            updateData,
        } = this.props;
        const {
            choices = [],
        } = data;

        choices.splice( i, 1 );

        updateData( { choices } );
    }

    updateChoice( i, newData ) {
        const {
            data,
            updateData,
        } = this.props;
        const {
            choices = [],
        } = data;

        if ( choices[ i ] ) {
            choices[ i ] = {
                ...choices[ i ],
                ...newData,
            };

            updateData( { choices } );
        }
    }

    resortChoice( oldIndex, newIndex ) {
        const {
            data,
            updateData,
        } = this.props;
        const {
            choices = [],
        } = data;

        const newChoices = arrayMove( choices, oldIndex, newIndex );

        updateData( { choices: newChoices } );
    }

    render() {
        const self = this;

        const {
            data,
        } = self.props;

        const {
            choices = [],
        } = data;

        const items = [];

        if ( choices && choices.length ) {
            choices.forEach( ( choice, i ) => {
                items.push( {
                    value: choice.value,
                    label: choice.label,
                    removeChoice() {
                        self.removeChoice( i );
                    },
                    updateChoice( newData ) {
                        self.updateChoice( i, newData );
                    },
                } );
            } );
        }

        return (
            <BaseControl
                label={ __( 'Choices', '@@text_domain' ) }
            >
                <div className="lzb-constructor-controls-item-settings-choices">
                    { items.length ? (
                        <SortableList
                            ref={ self.sortRef }
                            items={ items }
                            onSortEnd={ ( { oldIndex, newIndex } ) => {
                                self.resortChoice( oldIndex, newIndex );
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
                    <div>
                        <Button
                            onClick={ self.addChoice }
                            isSecondary
                            isSmall
                        >
                            { __( '+ Add Choice', '@@text_domain' ) }
                        </Button>
                    </div>
                </div>
            </BaseControl>
        );
    }
}
