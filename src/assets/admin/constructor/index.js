import './store';
import '../store';

// Internal Dependencies
import DocumentTabs from '../components/document-tabs';
import Box from '../components/box';

import GeneralSettings from './blocks/general';
import SupportsSettings from './blocks/supports';
import ConditionSettings from './blocks/condition';
import ControlsSettings from './blocks/controls';
import SelectedControlSettings from './blocks/selected-control-settings';
import CustomCodeSettings from './blocks/code';

import '../components/tab-panel';

/**
 * Internal dependencies
 */
const $ = window.jQuery;

const {
    registerBlockType,
    createBlock,
} = wp.blocks;

const { registerPlugin } = wp.plugins;

const { __ } = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
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

        if ( ! blockData || 'undefined' === typeof blockData.slug ) {
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
                    <Box no-paddings>
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
    withSelect( ( select ) => {
        const blockData = select( 'lazy-blocks/block-data' ).getBlockData();

        return {
            blockData,
        };
    } ),
    withDispatch( ( dispatch ) => ( {
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

    save() {
        return null;
    },
} );

// de-select active control when click outside.
$( document ).on( 'click', ( e ) => {
    const $this = $( e.target );
    const selectedControlId = wp.data.select( 'lazy-blocks/block-data' ).getSelectedControlId();
    const { clearSelectedControl } = wp.data.dispatch( 'lazy-blocks/block-data' );

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

class UpdateEditor extends Component {
    componentDidMount() {
        const {
            isSavingPost,
            isAutosavingPost,
        } = this.props;

        this.defaultBlockData = false;
        this.editorRefreshTimeout = false;

        this.wasSavingPost = isSavingPost;
        this.wasAutosavingPost = isAutosavingPost;

        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    /**
     * Run when something changed in editor.
     */
    update() {
        this.changeToVisualMode();
        this.addBlock();
        this.alwaysSelectBlock();
        this.checkIfPostEdited();
        this.saveMetaOnPostUpdate();
    }

    /**
     * Force change gutenberg edit mode to Visual.
     */
    changeToVisualMode() {
        const {
            editorSettings,
            editorMode,
            switchEditorMode,
        } = this.props;

        if ( ! editorSettings.richEditingEnabled ) {
            return;
        }

        if ( 'text' === editorMode ) {
            switchEditorMode();
        }
    }

    /**
     * Add default block to post if doesn't exist.
     */
    addBlock() {
        if ( this.blocksRestoreBusy ) {
            return;
        }

        const {
            resetBlocks,
            insertBlocks,
            blocks,
        } = this.props;

        const isValidList = 1 === blocks.length && blocks[ 0 ] && 'lzb-constructor/main' === blocks[ 0 ].name;

        if ( ! isValidList ) {
            this.blocksRestoreBusy = true;
            resetBlocks( [] );
            insertBlocks(
                createBlock( 'lzb-constructor/main' )
            );
            this.blocksRestoreBusy = false;
        }
    }

    /**
     * Always select block.
     */
    alwaysSelectBlock() {
        const {
            selectedBlock,
            blocks,
            selectBlock,
        } = this.props;

        // if selected block, do nothing.
        if ( selectedBlock && 'lzb-constructor/main' === selectedBlock.name ) {
            return;
        }

        // check if selected post title, also do nothing.
        if ( $( '.editor-post-title__block.is-selected' ).length ) {
            return;
        }

        let selectBlockId = '';
        blocks.forEach( ( blockData ) => {
            if ( 'lzb-constructor/main' === blockData.name ) {
                selectBlockId = blockData.clientId;
            }
        } );

        if ( selectBlockId ) {
            selectBlock( selectBlockId );
        }
    }

    /**
     * Check if post meta data edited and allow to update the post.
     */
    checkIfPostEdited() {
        const {
            isSavingPost,
            isAutosavingPost,
            blockData,
            editPost,
        } = this.props;

        if ( ! blockData || ! Object.keys( blockData ).length ) {
            return;
        }

        if ( isSavingPost || isAutosavingPost || ! this.defaultBlockData ) {
            this.defaultBlockData = JSON.stringify( blockData );
            return;
        }

        clearTimeout( this.editorRefreshTimeout );
        this.editorRefreshTimeout = setTimeout( () => {
            if ( this.defaultBlockData !== JSON.stringify( blockData ) ) {
                editPost( { edited: new Date() } );
            }
        }, 150 );
    }

    /**
     * Save meta data on post save.
     */
    saveMetaOnPostUpdate() {
        const {
            isSavingPost,
            isAutosavingPost,
            postId,
            blockData,
        } = this.props;

        const shouldUpdate = this.wasSavingPost && ! isSavingPost && ! this.wasAutosavingPost;

        // Save current state for next inspection.
        this.wasSavingPost = isSavingPost;
        this.wasAutosavingPost = isAutosavingPost;

        if ( shouldUpdate ) {
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
    }

    render() {
        return null;
    }
}

registerPlugin( 'lazy-blocks-constructor', {
    render: compose(
        withSelect( ( select ) => {
            const {
                isSavingPost,
                isAutosavingPost,
                getCurrentPostId,
                getEditorSettings,
            } = select( 'core/editor' );

            const {
                getSelectedBlock,
                getBlocks,
            } = select( 'core/block-editor' );

            const {
                getEditorMode,
            } = select( 'core/edit-post' );

            const {
                getBlockData,
            } = select( 'lazy-blocks/block-data' );

            return {
                isSavingPost: isSavingPost(),
                isAutosavingPost: isAutosavingPost(),
                selectedBlock: getSelectedBlock(),
                editorSettings: getEditorSettings(),
                editorMode: getEditorMode(),
                blocks: getBlocks(),
                postId: getCurrentPostId(),
                blockData: getBlockData(),
            };
        } ),
        withDispatch( ( dispatch ) => {
            const {
                selectBlock,
                insertBlocks,
                resetBlocks,
            } = dispatch( 'core/block-editor' );

            const {
                editPost,
            } = dispatch( 'core/editor' );

            const {
                switchEditorMode,
            } = dispatch( 'core/edit-post' );

            return {
                selectBlock,
                insertBlocks,
                resetBlocks,
                editPost,
                switchEditorMode,
            };
        } ),
    )( UpdateEditor ),
} );
