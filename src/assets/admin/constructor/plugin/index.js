/**
 * WordPress dependencies
 */
const $ = window.jQuery;

const { createBlock } = wp.blocks;

const { registerPlugin } = wp.plugins;

const { useEffect, useRef } = wp.element;

const { useSelect, useDispatch } = wp.data;

const { apiFetch } = wp;

export default function UpdateEditor() {
  const {
    isSavingPost,
    isAutosavingPost,
    selectedBlock,
    editorSettings,
    editorMode,
    blocks,
    postId,
    blockData,
  } = useSelect((select) => {
    const {
      isSavingPost: checkIsSavingPost,
      isAutosavingPost: checkIsAutosavingPost,
      getCurrentPostId,
      getEditorSettings,
    } = select('core/editor');

    const { getSelectedBlock, getBlocks } = select('core/block-editor');

    const { getEditorMode } = select('core/edit-post');

    const { getBlockData } = select('lazy-blocks/block-data');

    return {
      isSavingPost: checkIsSavingPost(),
      isAutosavingPost: checkIsAutosavingPost(),
      selectedBlock: getSelectedBlock(),
      editorSettings: getEditorSettings(),
      editorMode: getEditorMode(),
      blocks: getBlocks(),
      postId: getCurrentPostId(),
      blockData: getBlockData(),
    };
  }, []);

  const { selectBlock, insertBlocks, resetBlocks } = useDispatch('core/block-editor');
  const { editPost } = useDispatch('core/editor');
  const { switchEditorMode } = useDispatch('core/edit-post');

  /**
   * Force change gutenberg edit mode to Visual.
   */
  useEffect(() => {
    if (editorSettings.richEditingEnabled && editorMode === 'text') {
      switchEditorMode();
    }
  }, [editorSettings, editorMode]);

  /**
   * Add default block to post if doesn't exist.
   */
  const blocksRestoreBusy = useRef(false);
  useEffect(() => {
    if (blocksRestoreBusy.current) {
      return;
    }

    const isValidList =
      blocks.length === 1 && blocks[0] && blocks[0].name === 'lzb-constructor/main';

    if (!isValidList) {
      blocksRestoreBusy.current = true;
      resetBlocks([]);
      insertBlocks(createBlock('lzb-constructor/main'));
      blocksRestoreBusy.current = false;
    }
  }, [blocks]);

  /**
   * Always select block.
   */
  useEffect(() => {
    // if selected block, do nothing.
    if (selectedBlock && selectedBlock.name === 'lzb-constructor/main') {
      return;
    }

    // check if selected post title, also do nothing.
    // `.editor-post-title.is-selected` is added since WP 5.9
    if ($('.editor-post-title__block.is-selected, .editor-post-title.is-selected').length) {
      return;
    }

    let selectBlockId = '';
    blocks.forEach((thisBlock) => {
      if (thisBlock.name === 'lzb-constructor/main') {
        selectBlockId = thisBlock.clientId;
      }
    });

    if (selectBlockId) {
      selectBlock(selectBlockId);
    }
  }, [selectedBlock, blocks]);

  /**
   * Check if post meta data edited and allow to update the post.
   */
  const defaultBlockData = useRef(false);
  const editorRefreshTimeout = useRef(false);
  useEffect(() => {
    if (!blockData || !Object.keys(blockData).length) {
      return;
    }

    if (isSavingPost || isAutosavingPost || !defaultBlockData.current) {
      defaultBlockData.current = JSON.stringify(blockData);
      return;
    }

    clearTimeout(editorRefreshTimeout.current);
    editorRefreshTimeout.current = setTimeout(() => {
      if (defaultBlockData.current !== JSON.stringify(blockData)) {
        editPost({ edited: new Date() });
      }
    }, 150);
  }, [isSavingPost, isAutosavingPost, blockData]);

  /**
   * Save meta data on post save.
   */
  const wasSavingPost = useRef(false);
  const wasAutosavingPost = useRef(false);
  useEffect(() => {
    const shouldUpdate = wasSavingPost.current && !isSavingPost && !wasAutosavingPost.current;

    // Save current state for next inspection.
    wasSavingPost.current = isSavingPost;
    wasAutosavingPost.current = isAutosavingPost;

    if (shouldUpdate) {
      apiFetch({
        path: '/lazy-blocks/v1/update-block-data/',
        method: 'POST',
        data: {
          data: blockData,
          post_id: postId,
        },
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response);
      });
    }
  }, [isSavingPost, isAutosavingPost, postId, blockData]);

  return null;
}

registerPlugin('lazy-blocks-constructor', {
  render: UpdateEditor,
});
