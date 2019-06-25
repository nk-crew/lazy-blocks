import './blocks.scss';

import './store';

// Internal Dependencies
import GeneralSettings from './blocks/general';
import SupportsSettings from './blocks/supports';
import ConditionSettings from './blocks/condition';
import ControlsSettings from './blocks/controls';
import CustomCodeSettings from './blocks/code';

import Tabs from './components/tabs';
import Box from './components/box';

/**
 * Internal dependencies
 */
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
} = wp.editor;

/**
 * Container block
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
                    <PanelBody>
                        <GeneralSettings
                            data={ blockData }
                            updateData={ updateBlockData }
                        />
                    </PanelBody>
                    <PanelBody title={ __( 'Supports' ) } initialOpen={ false }>
                        <SupportsSettings
                            data={ blockData }
                            updateData={ updateBlockData }
                        />
                    </PanelBody>
                    <PanelBody title={ __( 'Condition' ) } initialOpen={ false }>
                        <ConditionSettings
                            data={ blockData }
                            updateData={ updateBlockData }
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="lzb-constructor">
                    <h2>{ __( 'Controls' ) }</h2>
                    <ControlsSettings
                        data={ blockData }
                        updateData={ updateBlockData }
                    />
                    <h2>{ __( 'Code' ) }</h2>
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
        const postId = select( 'core/editor' ).getCurrentPostId();
        const blockData = select( 'lazy-blocks/block-data' ).getBlockData( postId );

        return {
            blockData,
        };
    } ),
    withDispatch( () => ( {
        updateBlockData( data ) {
            const postId = select( 'core/editor' ).getCurrentPostId();
            dispatch( 'lazy-blocks/block-data' ).updateBlockData( postId, data );
            dispatch( 'core/editor' ).editPost( { edited: true } );
        },
    } ) ),
] )( ConstructorBlock );

registerBlockType( 'lzb-constructor/main', {
    title: __( 'Block constructor.' ),
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
const getBlockList = () => wp.data.select( 'core/editor' ).getBlocks();
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
        wp.data.dispatch( 'core/editor' ).resetBlocks( [] );
        wp.data.dispatch( 'core/editor' ).insertBlocks(
            wp.blocks.createBlock( 'lzb-constructor/main' )
        );
        blocksRestoreBusy = false;
    }
} );

// always select main block.
subscribe( () => {
    const selectedBlock = wp.data.select( 'core/editor' ).getSelectedBlock();
    const blocks = wp.data.select( 'core/editor' ).getBlocks();

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
        wp.data.dispatch( 'core/editor' ).selectBlock( selectBlockId );
    }
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
        const blockData = select( 'lazy-blocks/block-data' ).getBlockData( postId );

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
