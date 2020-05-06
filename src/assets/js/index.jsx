// External Dependencies.
import classnames from 'classnames/dedupe';
import { throttle } from 'throttle-debounce';

// Internal Dependencies
import './blocks/free';
import './extensions/block-id';

import getControlTypeData from '../admin/utils/get-control-type-data';

import PreviewServerCallback from './blocks/preview-server-callback';

let options = window.lazyblocksGutenberg;
if ( ! options || ! options.blocks || ! options.blocks.length ) {
    options = {
        post_type: 'post',
        blocks: [],
        controls: {},
    };
}

const {
    cloneDeep,
} = window.lodash;

const {
    __,
} = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const {
    applyFilters,
} = wp.hooks;

const {
    PanelBody,
    Notice,
    Tooltip,
} = wp.components;

const {
    InspectorControls,
    InnerBlocks,
} = wp.blockEditor;

const {
    registerBlockType,
} = wp.blocks;

const {
    withSelect,
    withDispatch,
} = wp.data;

const {
    compose,
} = wp.compose;

// each registered block.
options.blocks.forEach( ( item ) => {
    class LazyBlock extends Component {
        constructor( ...args ) {
            super( ...args );

            this.isControlValueValid = this.isControlValueValid.bind( this );
            this.maybeLockPostSaving = throttle( 500, this.maybeLockPostSaving.bind( this ) );
            this.getControlValue = this.getControlValue.bind( this );
            this.onControlChange = this.onControlChange.bind( this );
            this.getControls = this.getControls.bind( this );
            this.renderControls = this.renderControls.bind( this );
        }

        componentDidMount() {
            this.maybeLockPostSaving();
        }

        componentDidUpdate() {
            this.maybeLockPostSaving();
        }

        onControlChange( val, control, childIndex ) {
            const {
                setAttributes,
            } = this.props;

            let { name } = control;

            // prepare child items.
            if ( control.child_of && item.controls[ control.child_of ] && -1 < childIndex ) {
                const childs = this.getControlValue( item.controls[ control.child_of ] );

                if ( childs && 'undefined' !== typeof childs[ childIndex ] ) {
                    childs[ childIndex ][ control.name ] = val;
                    val = childs;
                }

                control = item.controls[ control.child_of ];
                name = control.name;
            }

            // filter control value.
            val = applyFilters( `lzb.editor.control.${ control.type }.updateValue`, val, control, childIndex );
            val = applyFilters( 'lzb.editor.control.updateValue', val, control, childIndex );

            const result = {};
            result[ name ] = val;

            setAttributes( result );
        }

        getControlValue( control, childIndex ) {
            const {
                attributes,
            } = this.props;

            let result = attributes[ control.name ];

            // prepare child items.
            if ( control.child_of && item.controls[ control.child_of ] && -1 < childIndex ) {
                const childs = this.getControlValue( item.controls[ control.child_of ] );

                if ( childs && 'undefined' !== typeof childs[ childIndex ] && 'undefined' !== typeof childs[ childIndex ][ control.name ] ) {
                    result = childs[ childIndex ][ control.name ];
                }
            }

            // filter control value.
            result = applyFilters( `lzb.editor.control.${ control.type }.getValue`, result, control, childIndex );
            result = applyFilters( 'lzb.editor.control.getValue', result, control, childIndex );

            return result;
        }

        /**
         * Get controls
         *
         * @param {String|Boolean} childOf - parent control name.
         *
         * @return {Object} controls list.
         */
        // eslint-disable-next-line class-methods-use-this
        getControls( childOf = '' ) {
            const result = {};

            Object.keys( item.controls ).forEach( ( k ) => {
                let control = item.controls[ k ];
                const controlTypeData = getControlTypeData( control.type );

                if ( controlTypeData && controlTypeData.attributes ) {
                    control = {
                        ...cloneDeep( controlTypeData.attributes ),
                        ...control,
                    };
                }

                if (
                    ( ! childOf && ! control.child_of )
                    || ( childOf && control.child_of === childOf )
                ) {
                    result[ k ] = control;
                }
            } );

            return result;
        }

        maybeLockPostSaving() {
            let shouldLock = 0;
            let thereIsRequired = false;

            // check all controls
            Object.keys( item.controls ).forEach( ( k ) => {
                const control = item.controls[ k ];

                if ( control.required && 'true' === control.required ) {
                    thereIsRequired = true;

                    // Child controls.
                    if ( control.child_of ) {
                        if ( item.controls[ control.child_of ] ) {
                            const childs = this.getControlValue( item.controls[ control.child_of ] );

                            if ( childs && childs.length ) {
                                childs.forEach( ( childData, childIndex ) => {
                                    const val = this.getControlValue( control, childIndex );

                                    if ( ! this.isControlValueValid( val, control ) ) {
                                        shouldLock += 1;
                                    }
                                } );
                            }
                        }

                        // Single controls.
                    } else {
                        const val = this.getControlValue( control );

                        if ( ! this.isControlValueValid( val, control ) ) {
                            shouldLock += 1;
                        }
                    }
                }
            } );

            // no required controls available.
            if ( ! thereIsRequired ) {
                return;
            }

            // lock or unlock post saving depending on required controls values.
            if ( 0 < shouldLock ) {
                this.props.lockPostSaving();
            } else {
                this.props.unlockPostSaving();
            }
        }

        // eslint-disable-next-line class-methods-use-this
        isControlValueValid( val, control ) {
            let isValid = '' !== val && 'undefined' !== typeof val;

            // custom validation filter.
            isValid = applyFilters( `lzb.editor.control.${ control.type }.isValueValid`, isValid, val, control );
            isValid = applyFilters( 'lzb.editor.control.isValueValid', isValid, val, control );

            return isValid;
        }

        /**
         * Render controls
         *
         * @param {String} placement - controls placement [inspector, content]
         * @param {String|Boolean} childOf - parent control name.
         * @param {Number|Boolean} childIndex - child index in parent.
         *
         * @return {Array} react blocks with controls.
         */
        renderControls( placement, childOf = '', childIndex = false ) {
            let result = [];
            const controls = this.getControls( childOf );

            // prepare attributes.
            Object.keys( controls ).forEach( ( k ) => {
                const control = controls[ k ];

                let placementCheck = control.type && 'nowhere' !== control.placement
                && ( 'both' === control.placement || control.placement === placement );
                let { label } = control;

                const controlTypeData = getControlTypeData( control.type );

                // restrictions.
                if ( controlTypeData && controlTypeData.restrictions ) {
                    // Restrict placement.
                    if (
                        placementCheck
                        && controlTypeData.restrictions.placement_settings
                    ) {
                        placementCheck = -1 < controlTypeData.restrictions.placement_settings.indexOf( placement );
                    }

                    // Restrict hide if not selected.
                    if (
                        placementCheck
                        && 'content' === placement
                        && 'content' === control.placement
                        && controlTypeData.restrictions.hide_if_not_selected_settings
                        && control.hide_if_not_selected
                        && 'true' === control.hide_if_not_selected
                    ) {
                        placementCheck = this.props.isLazyBlockSelected;
                    }

                    // Restrict required mark
                    if (
                        controlTypeData.restrictions.required_settings
                        && control.required
                        && 'true' === control.required
                    ) {
                        label = (
                            <Fragment>
                                { label }
                                <span className="required">*</span>
                            </Fragment>
                        );
                    }
                }

                // prepare control output
                if ( control.child_of || placementCheck ) {
                    // prepare data for filter.
                    const controlData = {
                        data: {
                            ...control,
                            label,
                        },
                        placement,
                        childIndex,
                        uniqueId: k,
                        getValue: ( optionalControl = control, optionalChildIndex = childIndex ) => this.getControlValue( optionalControl, optionalChildIndex ),
                        onChange: ( val ) => {
                            this.onControlChange( val, control, childIndex );
                        },
                        getControls: this.getControls,
                        renderControls: this.renderControls,
                    };

                    // get control data from filter.
                    let controlResult = applyFilters( `lzb.editor.control.${ control.type }.render`, '', controlData, this.props );

                    if ( controlResult ) {
                        let controlNotice = '';
                        controlResult = applyFilters( 'lzb.editor.control.render', controlResult, controlData, this.props );

                        // show error for required fields
                        if (
                            controlTypeData
                            && controlTypeData.restrictions.required_settings
                            && control.required
                            && 'true' === control.required
                        ) {
                            const val = this.getControlValue( control, childIndex );

                            if ( ! this.isControlValueValid( val, control ) ) {
                                controlNotice = (
                                    <Notice
                                        key={ `notice-${ control.name }` }
                                        status="warning"
                                        isDismissible={ false }
                                    >
                                        { __( 'This field is required', '@@text_domain' ) }
                                    </Notice>
                                );
                            }
                        }

                        result.push(
                            <div
                                key={ `control-${ k }` }
                                style={ {
                                    width: control.width ? `${ control.width }%` : '',
                                } }
                            >
                                { controlResult }
                                { controlNotice }
                            </div>
                        );
                    }
                }
            } );

            // additional element for better formatting in inspector.
            if ( 'inspector' === placement && result.length ) {
                result = <PanelBody>{ result }</PanelBody>;
            }

            return result;
        }

        render() {
            const {
                blockUniqueClass = '',
            } = this.props.attributes;

            const className = classnames(
                'lazyblock',
                `wp-block-${ item.slug.replace( '/', '-' ) }`,
                blockUniqueClass
            );

            const attsForRender = {};

            // prepare data for preview.
            Object.keys( item.controls ).forEach( ( k ) => {
                if ( ! item.controls[ k ].child_of ) {
                    attsForRender[ item.controls[ k ].name ] = this.getControlValue( item.controls[ k ] );
                }
            } );

            // reserved attributes.
            const reservedAttributes = [
                'lazyblock',
                'className',
                'align',
                'anchor',
                'blockId',
                'blockUniqueClass',
            ];
            reservedAttributes.forEach( ( attr ) => {
                attsForRender[ attr ] = this.props.attributes[ attr ];
            } );

            // show code preview
            let showPreview = true;

            switch ( item.code.show_preview ) {
            case 'selected':
                showPreview = this.props.isLazyBlockSelected;
                break;
            case 'unselected':
                showPreview = ! this.props.isLazyBlockSelected;
                break;
            case 'never':
                showPreview = false;
                break;
            // no default
            }

            return (
                <Fragment>
                    <InspectorControls>
                        <div className="lzb-inspector-controls">
                            { this.renderControls( 'inspector' ) }
                        </div>
                    </InspectorControls>
                    <div className={ className }>
                        <div className="lzb-content-title">
                            { item.icon && /^dashicons/.test( item.icon ) ? (
                                <span className={ item.icon } />
                            ) : '' }
                            { item.icon && ! /^dashicons/.test( item.icon ) ? (
                                // eslint-disable-next-line react/no-danger
                                <span dangerouslySetInnerHTML={ { __html: item.icon } } />
                            ) : '' }

                            <h6>{ item.title }</h6>

                            { item.edit_url ? (
                                <Tooltip text={ __( 'Edit Block', '@@text_domain' ) }>
                                    <a
                                        href={ item.edit_url.replace( '&amp;', '&' ) }
                                        className="lzb-content-edit-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.478 12.54C19.518 12.24 19.538 11.93 19.538 11.6C19.538 11.28 19.518 10.96 19.468 10.66L21.498 9.08C21.678 8.94 21.728 8.67 21.618 8.47L19.698 5.15C19.578 4.93 19.328 4.86 19.108 4.93L16.718 5.89C16.218 5.51 15.688 5.19 15.098 4.95L14.738 2.41C14.698 2.17 14.498 2 14.258 2H10.418C10.178 2 9.988 2.17 9.948 2.41L9.588 4.95C8.998 5.19 8.458 5.52 7.968 5.89L5.578 4.93C5.358 4.85 5.108 4.93 4.988 5.15L3.078 8.47C2.958 8.68 2.998 8.94 3.198 9.08L5.228 10.66C5.178 10.96 5.138 11.29 5.138 11.6C5.138 11.91 5.158 12.24 5.208 12.54L3.178 14.12C2.998 14.26 2.948 14.53 3.058 14.73L4.978 18.05C5.098 18.27 5.348 18.34 5.568 18.27L7.958 17.31C8.458 17.69 8.988 18.01 9.578 18.25L9.938 20.79C9.988 21.03 10.178 21.2 10.418 21.2H14.258C14.498 21.2 14.698 21.03 14.728 20.79L15.088 18.25C15.678 18.01 16.218 17.69 16.708 17.31L19.098 18.27C19.318 18.35 19.568 18.27 19.688 18.05L21.608 14.73C21.728 14.51 21.678 14.26 21.488 14.12L19.478 12.54ZM12.338 15.2C10.358 15.2 8.738 13.58 8.738 11.6C8.738 9.62 10.358 8 12.338 8C14.318 8 15.938 9.62 15.938 11.6C15.938 13.58 14.318 15.2 12.338 15.2Z" fill="currentColor" /></svg>
                                    </a>
                                </Tooltip>
                            ) : '' }
                        </div>
                        <div className="lzb-content-controls">
                            { this.renderControls( 'content' ) }
                        </div>
                        { showPreview ? (
                            <PreviewServerCallback
                                block={ item.slug }
                                attributes={ attsForRender }
                            />
                        ) : '' }
                    </div>
                </Fragment>
            );
        }
    }

    const LazyBlockWithSelect = compose( [
        withSelect( ( select, ownProps ) => {
            const {
                hasSelectedInnerBlock,
            } = select( 'core/block-editor' );

            return {
                isLazyBlockSelected: ownProps.isSelected || hasSelectedInnerBlock( ownProps.clientId ),
            };
        } ),
        withDispatch( ( dispatch, ownProps ) => {
            const {
                lockPostSaving,
                unlockPostSaving,
            } = dispatch( 'core/editor' );

            return {
                lockPostSaving() {
                    lockPostSaving( `lazyblock-${ ownProps.clientId }` );
                },
                unlockPostSaving() {
                    unlockPostSaving( `lazyblock-${ ownProps.clientId }` );
                },
            };
        } ),
    ] )( LazyBlock );

    // conditionally show for specific post type.
    if ( item.supports.inserter && item.condition.length ) {
        let preventInsertion = true;
        item.condition.forEach( ( val ) => {
            if ( val === options.post_type ) {
                preventInsertion = false;
            }
        } );
        item.supports.inserter = ! preventInsertion;
    }

    let registerIcon = '';

    if ( item.icon && /^dashicons/.test( item.icon ) ) {
        registerIcon = item.icon.replace( /^dashicons dashicons-/, '' ) || 'marker';
    } else if ( item.icon ) {
        // eslint-disable-next-line react/no-danger
        registerIcon = <span dangerouslySetInnerHTML={ { __html: item.icon } } />;
    }

    // register block.
    registerBlockType( item.slug, {
        title: item.title || item.slug,
        description: item.description,
        icon: registerIcon,
        category: item.category,
        keywords: item.keywords,
        supports: item.supports,

        ghostkit: item.ghostkit,

        lazyblock: true,

        edit: LazyBlockWithSelect,

        save() {
            let result = null;

            // Return inner blocks content to use it in PHP render.
            Object.keys( item.controls ).forEach( ( k ) => {
                if ( 'inner_blocks' === item.controls[ k ].type ) {
                    result = <InnerBlocks.Content />;
                }
            } );

            return result;
        },
    } );
} );
