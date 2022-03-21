import shorthash from 'shorthash';

const { addFilter } = wp.hooks;

const { useEffect } = wp.element;

const { getBlockType } = wp.blocks;

const { createHigherOrderComponent } = wp.compose;

/**
 * List of used IDs to prevent duplicates.
 *
 * @type {Object}
 */
const usedIds = {};

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom styles if needed.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withUniqueBlockId = createHigherOrderComponent(
  (BlockEdit) =>
    function newEdit(props) {
      const { setAttributes, attributes, clientId, name } = props;
      const { blockId } = attributes;
      const blockSettings = getBlockType(name);

      function maybeCreateBlockId() {
        if (!blockSettings.lazyblock) {
          return;
        }

        if (!blockId || usedIds[blockId] !== clientId) {
          let newBlockId = '';

          // check if ID already exist.
          let tryCount = 10;
          while (
            !newBlockId ||
            (typeof usedIds[newBlockId] !== 'undefined' &&
              usedIds[newBlockId] !== clientId &&
              tryCount > 0)
          ) {
            newBlockId = shorthash.unique(clientId);
            tryCount -= 1;
          }

          if (newBlockId && typeof usedIds[newBlockId] === 'undefined') {
            usedIds[newBlockId] = clientId;
          }

          if (newBlockId !== blockId) {
            const newClass = `${name.replace('/', '-')}-${newBlockId}`;

            setAttributes({
              blockId: newBlockId,
              blockUniqueClass: newClass,
            });
          }
        }
      }

      useEffect(() => {
        // fix duplicated classes after block clone.
        if (clientId && attributes.blockId && typeof usedIds[attributes.blockId] === 'undefined') {
          usedIds[attributes.blockId] = clientId;
        }
      }, []);

      useEffect(() => {
        maybeCreateBlockId();
      });

      return <BlockEdit {...props} />;
    },
  'withUniqueBlockId'
);

addFilter('editor.BlockEdit', 'lazyblocks/uniqueBlockId', withUniqueBlockId);
