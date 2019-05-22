import './blocks.scss';

import './store';

// Internal Dependencies
import GeneralSettings from './blocks/general';
import SupportsSettings from './blocks/supports';
import ConditionSettings from './blocks/condition';
import ControlsSettings from './blocks/controls';
import CustomCodeSettings from './blocks/code';

import Tabs from './components/tabs';

/**
 * Internal dependencies
 */
const {
    registerBlockType,
} = wp.blocks;
const { __ } = wp.i18n;
const { Component } = wp.element;

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
} = wp.components;

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
            <div className="lzb-constructor">
                <Tabs
                    tabs={ [
                        {
                            name: 'general',
                            title: __( 'General' ),
                        }, {
                            name: 'supports',
                            title: __( 'Supports' ),
                        }, {
                            name: 'condition',
                            title: __( 'Condition' ),
                        }, {
                            name: 'code',
                            title: __( 'Code' ),
                        },
                    ] }
                >
                    { ( tabData ) => {
                        // Supports.
                        if ( 'supports' === tabData.name ) {
                            return (
                                <SupportsSettings
                                    data={ blockData }
                                    updateData={ updateBlockData }
                                />
                            );
                        }

                        // Condition.
                        if ( 'condition' === tabData.name ) {
                            return (
                                <ConditionSettings
                                    data={ blockData }
                                    updateData={ updateBlockData }
                                />
                            );
                        }

                        // Code.
                        if ( 'code' === tabData.name ) {
                            return (
                                <CustomCodeSettings
                                    data={ blockData }
                                    updateData={ updateBlockData }
                                />
                            );
                        }

                        // General.
                        return (
                            <GeneralSettings
                                data={ blockData }
                                updateData={ updateBlockData }
                            />
                        );
                    } }
                </Tabs>

                <h2>{ __( 'Controls' ) }</h2>
                <ControlsSettings
                    data={ blockData }
                    updateData={ updateBlockData }
                />
            </div>
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
wp.data.subscribe( () => {
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
