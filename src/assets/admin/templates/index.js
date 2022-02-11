// External Dependencies.
import { debounce } from 'throttle-debounce';

/**
 * Internal dependencies
 */
const { createBlock } = wp.blocks;

const { registerPlugin } = wp.plugins;

const { __ } = wp.i18n;

const { Component } = wp.element;

const { compose } = wp.compose;

const { withSelect, withDispatch } = wp.data;

const { PanelRow, SelectControl } = wp.components;

const { PluginDocumentSettingPanel } = wp.editPost || {};

const { used_post_types_for_templates: usedPostTypes } = window.lazyblocksTemplatesData || {};

class UpdateEditor extends Component {
  constructor(...args) {
    super(...args);

    this.updateBlocksMeta = debounce(500, this.updateBlocksMeta.bind(this));
  }

  componentDidUpdate() {
    this.update();
  }

  /**
   * Run when something changed in editor.
   */
  update() {
    this.fallbackTemplateBlocks();
    this.updateBlocksMeta();
  }

  /**
   * Fallback for old template editor. Restore all blocks inside editor directly.
   */
  fallbackTemplateBlocks() {
    const {
      templateConvertBlocksToContent,
      templateBlocks,
      resetBlocks,
      insertBlocks,
      updateMeta,
    } = this.props;

    if (this.dontRunFallback || !templateConvertBlocksToContent) {
      return;
    }

    this.dontRunFallback = true;

    const newBlocks = JSON.parse(decodeURIComponent(templateBlocks));

    if (newBlocks && newBlocks.length) {
      const newBlocksResult = [];

      newBlocks.forEach((blockData) => {
        try {
          newBlocksResult.push(createBlock(blockData[0]));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      });

      resetBlocks([]);
      insertBlocks(newBlocksResult);
    }

    updateMeta('_lzb_template_convert_blocks_to_content', false);
  }

  /**
   * Convert blocks data to template data.
   */
  convertBlocksToTemplate(blocks) {
    const result = [];

    blocks.forEach((blockData) => {
      const resultBlockData = [blockData.name, blockData.attributes];

      if (blockData.innerBlocks && blockData.innerBlocks.length) {
        resultBlockData.push(this.convertBlocksToTemplate(blockData.innerBlocks));
      }

      result.push(resultBlockData);
    });

    return result;
  }

  /**
   * Convert blocks to the meta to easily work with it in PHP.
   */
  updateBlocksMeta() {
    const { templateBlocks, blocks, updateMeta } = this.props;

    const blocksString = encodeURIComponent(JSON.stringify(this.convertBlocksToTemplate(blocks)));

    if (templateBlocks !== blocksString) {
      updateMeta('_lzb_template_blocks', blocksString);
    }
  }

  render() {
    const { templateLock, templatePostTypes, postTypes, updateMeta } = this.props;

    const templateLockOptions = [
      {
        label: __('None', '@@text_domain'),
        value: '',
      },
      {
        label: __('Prevent all operations', '@@text_domain'),
        value: 'all',
      },
      {
        label: __('Prevent inserting new blocks, but allows moving existing ones', '@@text_domain'),
        value: 'insert',
      },
    ];

    // Default options.
    const postTypesOptions = [];
    const postTypesArray = [];

    postTypes
      .filter(
        (post) =>
          post.viewable &&
          post.slug !== 'lazyblocks' &&
          post.slug !== 'lazyblocks_templates' &&
          post.slug !== 'attachment'
      )
      .forEach((post) => {
        let { label } = post;

        if (post.labels && post.labels.singular_name) {
          label = post.labels.singular_name;
        }

        postTypesArray.push(post.slug);

        postTypesOptions.push({
          label,
          value: post.slug,
          disabled: usedPostTypes.includes(post.slug),
        });
      });

    // Display selected post type in select in case if it is not exists.
    // For example, when removed plugin, which works with this custom post type.
    if (templatePostTypes && templatePostTypes.length) {
      templatePostTypes.forEach((postType) => {
        if (!postTypesArray.includes(postType)) {
          postTypesOptions.push({
            label: postType,
            value: postType,
          });
        }
      });
    }

    return (
      <PluginDocumentSettingPanel
        name="LZBTemplateSettings"
        title={__('Template Settings', '@@text_domain')}
        className="lzb-template-settings-panel"
      >
        <PanelRow>
          <SelectControl
            label={__('Post Types', '@@text_domain')}
            multiple
            options={postTypesOptions}
            value={templatePostTypes}
            onChange={(value) => {
              updateMeta('_lzb_template_post_types', value);
            }}
          />
        </PanelRow>
        <PanelRow>
          <SelectControl
            label={__('Template Lock', '@@text_domain')}
            options={templateLockOptions}
            value={templateLock}
            onChange={(value) => {
              updateMeta('_lzb_template_lock', value);
            }}
          />
        </PanelRow>
      </PluginDocumentSettingPanel>
    );
  }
}

registerPlugin('lazy-blocks-template', {
  render: compose(
    withSelect((select) => {
      const { getEditedPostAttribute } = select('core/editor');

      const { getPostTypes } = select('core');

      const { getBlocks } = select('core/block-editor');

      const meta = getEditedPostAttribute('meta') || {};

      return {
        // eslint-disable-next-line no-underscore-dangle
        templatePostTypes: meta._lzb_template_post_types || [],
        // eslint-disable-next-line no-underscore-dangle
        templateLock: meta._lzb_template_lock || '',
        // eslint-disable-next-line no-underscore-dangle
        templateBlocks: meta._lzb_template_blocks || '',
        // eslint-disable-next-line no-underscore-dangle
        templateConvertBlocksToContent: meta._lzb_template_convert_blocks_to_content || false,
        postTypes:
          getPostTypes({
            show_ui: true,
            per_page: -1,
          }) || [],
        blocks: getBlocks(),
      };
    }),
    withDispatch((dispatch) => {
      const { insertBlocks, resetBlocks } = dispatch('core/block-editor');

      const { editPost } = dispatch('core/editor');

      return {
        insertBlocks,
        resetBlocks,
        updateMeta(name, val) {
          editPost({ meta: { [name]: val } });
        },
      };
    })
  )(UpdateEditor),
});
