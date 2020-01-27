/* eslint-disable camelcase */
import classnames from 'classnames/dedupe';
import * as clipboard from 'clipboard-polyfill';

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

import getControlTypeData from '../../../utils/get-control-type-data';

class Control extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            collapsedChilds: false,
            copied: false,
        };

        this.toggleCollapseChilds = this.toggleCollapseChilds.bind( this );
        this.copyName = this.copyName.bind( this );
    }

    toggleCollapseChilds() {
        this.setState( { collapsedChilds: ! this.state.collapsedChilds } );
    }

    copyName( name ) {
        clipboard.writeText( name );

        this.setState( {
            copied: true,
        } );

        clearTimeout( this.copiedTimeout );

        this.copiedTimeout = setTimeout( () => {
            this.setState( {
                copied: false,
            } );
        }, 350 );
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
            placeholder,
            save_in_meta,
            save_in_meta_name,
            type,
            required,
        } = data;

        const controlTypeData = getControlTypeData( type );

        let controlName = name;
        if ( 'true' === save_in_meta ) {
            controlName = save_in_meta_name || name;
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
                    <div className="lzb-constructor-controls-item-icon">
                        <span dangerouslySetInnerHTML={ { __html: controlTypeData.icon } } />
                        <DragHandle />
                    </div>
                    <div className="lzb-constructor-controls-item-label">
                        <span>
                            { label || placeholder || <span>&nbsp;</span> }
                            { 'true' === required ? (
                                <span className="required">*</span>
                            ) : '' }
                        </span>
                    </div>
                    { ! data.child_of && controlName ? (
                        <button
                            className="lzb-constructor-controls-item-name"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.copyName( controlName );
                            } }
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM15 5H8C6.9 5 6.01 5.9 6.01 7L6 21C6 22.1 6.89 23 7.99 23H19C20.1 23 21 22.1 21 21V11L15 5ZM8 21V7H14V12H19V21H8Z" fill="currentColor" /></svg>
                            { controlName }
                            { this.state.copied ? (
                                <span className="lzb-constructor-controls-item-name-copied">
                                    { __( 'Copied!', '@@text_domain' ) }
                                </span>
                            ) : '' }
                        </button>
                    ) : '' }
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
