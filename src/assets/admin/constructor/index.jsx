import './store';

// Internal Dependencies
import GeneralSettings from './blocks/general';
import SupportsSettings from './blocks/supports';
import ConditionSettings from './blocks/condition';
import ControlsSettings from './blocks/controls';
import SelectedControlSettings from './blocks/selected-control-settings';
import CustomCodeSettings from './blocks/code';

import '../components/tab-panel';
import DocumentTabs from '../components/document-tabs';
import Box from '../components/box';

const { isEqual } = window.lodash;

/**
 * Internal dependencies
 */
const $ = window.jQuery;

const {
    registerBlockType,
} = wp.blocks;

const { __ } = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
    dispatch,
    select,
    subscribe,
} = wp.data;

const {
    apiFetch,
} = wp;

const {
    Spinner,
    PanelBody,
} = wp.components;

const {
    InspectorControls,
} = wp.blockEditor;

/**
 * Constructor block
 */
class ConstructorBlock extends Component {
    render() {
        const {
            blockData,
            updateBlockData,
        } = this.props;

        if ( ! blockData || typeof blockData.slug === 'undefined' ) {
            return (
                <div className="lzb-constructor-loading">
                    <Spinner />
                </div>
            );
        }

        return (
            <Fragment>
                <InspectorControls>
                    <DocumentTabs>
                        { ( tabData ) => {
                            // Selected control settings.
                            if ( 'control' === tabData.name ) {
                                return (
                                    <SelectedControlSettings />
                                );
                            }

                            // Block settings.
                            return (
                                <Fragment>
                                    <GeneralSettings
                                        data={ blockData }
                                        updateData={ updateBlockData }
                                    />
                                    <PanelBody title={ __( 'Supports', '@@text_domain' ) } initialOpen={ false }>
                                        <SupportsSettings
                                            data={ blockData }
                                            updateData={ updateBlockData }
                                        />
                                    </PanelBody>
                                    <PanelBody title={ __( 'Condition', '@@text_domain' ) } initialOpen={ false }>
                                        <ConditionSettings
                                            data={ blockData }
                                            updateData={ updateBlockData }
                                        />
                                    </PanelBody>
                                </Fragment>
                            );
                        } }
                    </DocumentTabs>
                </InspectorControls>
                <div className="lzb-constructor">
                    <h2>{ __( 'Controls', '@@text_domain' ) }</h2>
                    <ControlsSettings
                        data={ blockData }
                        updateData={ updateBlockData }
                    />
                    <h2>{ __( 'Code', '@@text_domain' ) }</h2>
                    <Box>
                        <CustomCodeSettings
                            data={ blockData }
                            updateData={ updateBlockData }
                        />
                    </Box>
                </div>
            </Fragment>
        );
    }
}

const ConstructorBlockWithSelect = compose( [
    withSelect( () => {
        const blockData = select( 'lazy-blocks/block-data' ).getBlockData();

        return {
            blockData,
        };
    } ),
    withDispatch( () => ( {
        updateBlockData( data ) {
            dispatch( 'lazy-blocks/block-data' ).updateBlockData( data );
        },
    } ) ),
] )( ConstructorBlock );

registerBlockType( 'lzb-constructor/main', {
    title: __( 'Blocks Constructor', '@@text_domain' ),
    category: 'common',
    supports: {
        html: false,
        className: false,
        customClassName: false,
        anchor: false,
        inserter: false,
    },

    edit: ConstructorBlockWithSelect,

    save: function() {
        return null;
    },
} );

// Add default block to post if doesn't exist.
const getBlockList = () => wp.data.select( 'core/block-editor' ).getBlocks();
let blockList = getBlockList();
let blocksRestoreBusy = false;
subscribe( () => {
    if ( blocksRestoreBusy ) {
        return;
    }

    const newBlockList = getBlockList();
    const blockListChanged = newBlockList !== blockList;
    const isValidList = newBlockList.length === 1 && newBlockList[ 0 ] && newBlockList[ 0 ].name === 'lzb-constructor/main';
    blockList = newBlockList;

    if ( blockListChanged && ! isValidList ) {
        blocksRestoreBusy = true;
        wp.data.dispatch( 'core/block-editor' ).resetBlocks( [] );
        wp.data.dispatch( 'core/block-editor' ).insertBlocks(
            wp.blocks.createBlock( 'lzb-constructor/main' )
        );
        blocksRestoreBusy = false;
    }
} );

// always select main block.
subscribe( () => {
    const selectedBlock = wp.data.select( 'core/block-editor' ).getSelectedBlock();
    const blocks = wp.data.select( 'core/block-editor' ).getBlocks();

    if ( selectedBlock && 'lzb-constructor/main' === selectedBlock.name ) {
        return;
    }

    let selectBlockId = '';
    blocks.forEach( ( blockData ) => {
        if ( 'lzb-constructor/main' === blockData.name ) {
            selectBlockId = blockData.clientId;
        }
    } );

    if ( selectBlockId ) {
        wp.data.dispatch( 'core/block-editor' ).selectBlock( selectBlockId );
    }
} );

// de-select active control when click outside.
$( document ).on( 'click', function( e ) {
    const $this = $( e.target );
    const selectedControlId = wp.data.select( 'lazy-blocks/block-data' ).getSelectedControlId();
    const clearSelectedControl = wp.data.dispatch( 'lazy-blocks/block-data' ).clearSelectedControl;

    if ( ! selectedControlId ) {
        return;
    }

    // click outside of content.
    if ( ! $this.closest( '.edit-post-layout__content' ).length ) {
        return;
    }

    // click on notice.
    if ( $this.closest( '.components-notice-list' ).length ) {
        return;
    }

    // click on control.
    if ( $this.closest( '.lzb-constructor-controls-item' ).length ) {
        return;
    }

    // click on code box.
    if ( $this.closest( '.lazyblocks-component-box' ).length ) {
        return;
    }

    // click on add control button.
    if ( $this.hasClass( 'lzb-constructor-controls-item-appender' ) ) {
        return;
    }

    // clear selected control.
    clearSelectedControl();
} );

// check if block data changed.
let defaultBlockData = false;
let editorRefreshTimeout = false;
subscribe( () => {
    const isSavingPost = select( 'core/editor' ).isSavingPost();
    const isAutosavingPost = select( 'core/editor' ).isAutosavingPost();
    const blockData = select( 'lazy-blocks/block-data' ).getBlockData();

    if ( ! blockData || ! Object.keys( blockData ).length ) {
        return;
    }

    if ( isSavingPost || isAutosavingPost || ! defaultBlockData ) {
        defaultBlockData = Object.assign( {}, blockData );
        return;
    }

    clearTimeout( editorRefreshTimeout );
    editorRefreshTimeout = setTimeout( () => {
        // isEqual can't determine that resorted objects are not equal.
        const changedControls = defaultBlockData.controls &&
                                blockData.controls &&
                                ! isEqual( Object.keys( defaultBlockData.controls ), Object.keys( blockData.controls ) );

        if ( changedControls || ! isEqual( defaultBlockData, blockData ) ) {
            wp.data.dispatch( 'core/editor' ).editPost( { edited: true } );
        }
    }, 150 );
} );

// save lazy block meta data on post save.
let wasSavingPost = select( 'core/editor' ).isSavingPost();
let wasAutosavingPost = select( 'core/editor' ).isAutosavingPost();
subscribe( () => {
    const isSavingPost = select( 'core/editor' ).isSavingPost();
    const isAutosavingPost = select( 'core/editor' ).isAutosavingPost();
    const shouldUpdate = wasSavingPost && ! isSavingPost && ! wasAutosavingPost;

    // Save current state for next inspection.
    wasSavingPost = isSavingPost;
    wasAutosavingPost = isAutosavingPost;

    if ( shouldUpdate ) {
        const postId = select( 'core/editor' ).getCurrentPostId();
        const blockData = select( 'lazy-blocks/block-data' ).getBlockData();

        apiFetch( {
            path: '/lazy-blocks/v1/update-block-data/',
            method: 'POST',
            data: {
                data: blockData,
                post_id: postId,
            },
        } )
            .catch( ( response ) => {
                // eslint-disable-next-line
                console.log( response );
            } );
    }
} );
