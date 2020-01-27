// External Dependencies.
import classnames from 'classnames/dedupe';
import { throttle } from 'throttle-debounce';

// Internal Dependencies
import './blocks/free.jsx';
import './extensions/block-id.jsx';

import PreviewServerCallback from './blocks/preview-server-callback.jsx';
import getControlTypeData from '../admin/utils/get-control-type-data';

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
        constructor() {
            super( ...arguments );

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

        isControlValueValid( val, control ) {
            let isValid = '' !== val && typeof val !== 'undefined';

            // custom validation filter.
            isValid = applyFilters( `lzb.editor.control.${ control.type }.isValueValid`, isValid, val, control );
            isValid = applyFilters( 'lzb.editor.control.isValueValid', isValid, val, control );

            return isValid;
        }

        maybeLockPostSaving() {
            let shouldLock = 0;
            let thereIsRequired = false;

            // check all controls
            Object.keys( item.controls ).forEach( ( k ) => {
                const control = item.controls[ k ];

                if ( control.required && 'true' === control.required ) {
                    thereIsRequired = true;

                    const val = this.getControlValue( control );

                    if ( ! this.isControlValueValid( val, control ) ) {
                        shouldLock += 1;
                    }
                }
            } );

            // no required controls available.
            if ( ! thereIsRequired ) {
                return;
            }

            // lock or unlock post saving depending on required controls values.
            if ( shouldLock > 0 ) {
                this.props.lockPostSaving();
            } else {
                this.props.unlockPostSaving();
            }
        }

        getControlValue( control, childIndex ) {
            const {
                attributes,
            } = this.props;

            let result = attributes[ control.name ];

            // prepare child items.
            if ( control.child_of && item.controls[ control.child_of ] && childIndex > -1 ) {
                const childs = this.getControlValue( item.controls[ control.child_of ] );

                if ( childs && typeof childs[ childIndex ] !== 'undefined' && typeof childs[ childIndex ][ control.name ] !== 'undefined' ) {
                    result = childs[ childIndex ][ control.name ];
                }
            }

            // filter control value.
            result = applyFilters( `lzb.editor.control.${ control.type }.getValue`, result, control );
            result = applyFilters( 'lzb.editor.control.getValue', result, control );

            return result;
        }

        onControlChange( val, control, childIndex ) {
            const {
                setAttributes,
            } = this.props;

            let name = control.name;

            // prepare child items.
            if ( control.child_of && item.controls[ control.child_of ] && childIndex > -1 ) {
                const childs = this.getControlValue( item.controls[ control.child_of ] );

                if ( childs && typeof childs[ childIndex ] !== 'undefined' ) {
                    childs[ childIndex ][ control.name ] = val;
                    val = childs;
                }

                control = item.controls[ control.child_of ];
                name = control.name;
            }

            // filter control value.
            val = applyFilters( `lzb.editor.control.${ control.type }.updateValue`, val, control );
            val = applyFilters( 'lzb.editor.control.updateValue', val, control );

            const result = {};
            result[ name ] = val;

            setAttributes( result );
        }

        /**
         * Get controls
         *
         * @param {String|Boolean} childOf - parent control name.
         *
         * @return {Object} controls list.
         */
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
                    ( ! childOf && ! control.child_of ) ||
                    ( childOf && control.child_of === childOf )
                ) {
                    result[ k ] = control;
                }
            } );

            return result;
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

                let placementCheck = control.type && control.placement !== 'nowhere' &&
                ( control.placement === 'both' || control.placement === placement );
                let label = control.label;

                const controlTypeData = getControlTypeData( control.type );

                // restrictions.
                if ( controlTypeData && controlTypeData.restrictions ) {
                    // Restrict placement.
                    if (
                        placementCheck &&
                        controlTypeData.restrictions.placement_settings
                    ) {
                        placementCheck = controlTypeData.restrictions.placement_settings.indexOf( placement ) > -1;
                    }

                    // Restrict hide if not selected.
                    if (
                        placementCheck &&
                        placement === 'content' &&
                        control.placement === 'content' &&
                        controlTypeData.restrictions.hide_if_not_selected_settings &&
                        control.hide_if_not_selected &&
                        'true' === control.hide_if_not_selected
                    ) {
                        placementCheck = this.props.isLazyBlockSelected;
                    }

                    // Restrict required mark
                    if (
                        controlTypeData.restrictions.required_settings &&
                        control.required &&
                        'true' === control.required
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
                        uniqueId: k,
                        getValue: ( optionalControl = control, optionalChildIndex = childIndex ) => {
                            return this.getControlValue( optionalControl, optionalChildIndex );
                        },
                        onChange: ( val ) => {
                            this.onControlChange( val, control, childIndex );
                        },
                        getControls: this.getControls,
                        renderControls: this.renderControls,
                    };

                    // get control data from filter.
                    let controlResult = applyFilters( `lzb.editor.control.${ control.type }.render`, '', controlData );

                    if ( controlResult ) {
                        controlResult = applyFilters( 'lzb.editor.control.render', controlResult, controlData );
                        result.push(
                            <div
                                key={ `control-${ k }` }
                                style={ {
                                    width: control.width ? `${ control.width }%` : '',
                                } }
                            >
                                { controlResult }
                            </div>
                        );
                    }

                    // show error for required fields
                    if (
                        controlTypeData &&
                        controlTypeData.restrictions.required_settings &&
                        control.required &&
                        'true' === control.required
                    ) {
                        const val = this.getControlValue( control, childIndex );

                        if ( ! this.isControlValueValid( val, control ) ) {
                            result.push( (
                                <Notice
                                    key={ `notice-${ control.name }` }
                                    status="warning"
                                    isDismissible={ false }
                                >
                                    { __( 'This field is required', '@@text_domain' ) }
                                </Notice>
                            ) );
                        }
                    }
                }
            } );

            // additional element for better formatting in inspector.
            if ( placement === 'inspector' && result.length ) {
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
                                <span dangerouslySetInnerHTML={ { __html: item.icon } } />
                            ) : '' }

                            <h6>{ item.title }</h6>
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
