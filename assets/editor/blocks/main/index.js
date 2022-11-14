/* eslint-disable no-param-reassign */
import BlockEdit from './edit';
import BlockSave from './save';

const { RawHTML } = wp.element;

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
  options = {
    blocks: [],
    controls: {},
  };
}

const { registerBlockType } = wp.blocks;

// each registered block.
options.blocks.forEach((item) => {
  // conditionally show for specific post type.
  if (item.supports.inserter && item.condition.length) {
    let preventInsertion = false;
    item.condition.forEach((val) => {
      if (window.pagenow && val === window.pagenow) {
        preventInsertion = true;
      }
    });
    item.supports.inserter = preventInsertion;
  }

  let registerIcon = '';

  if (item.icon && /^dashicons/.test(item.icon)) {
    registerIcon = item.icon.replace(/^dashicons dashicons-/, '') || 'marker';
  } else if (item.icon) {
    // eslint-disable-next-line react/no-danger
    registerIcon = <span dangerouslySetInnerHTML={{ __html: item.icon }} />;
  }

  // register block.
  registerBlockType(item.slug, {
    apiVersion: 2,
    title: item.title || item.slug,
    description: <RawHTML>{item.description}</RawHTML>,
    icon: registerIcon,
    category: item.category,
    keywords: item.keywords,
    supports: item.supports,

    ghostkit: item.ghostkit,

    lazyblock: true,

    edit(props) {
      return <BlockEdit {...props} lazyBlockData={item} />;
    },

    save(props) {
      return <BlockSave {...props} lazyBlockData={item} />;
    },
  });
});
