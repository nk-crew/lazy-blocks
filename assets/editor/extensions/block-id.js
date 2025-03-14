/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent, useThrottle } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';

import useAllBlocks from '../../hooks/use-all-blocks';

function useBlockID(props) {
	const { attributes, clientId, name } = props;
	const blockSettings = getBlockType(name);
	const didMountRef = useRef(false);

	const allBlocks = useAllBlocks();

	const { updateBlockAttributes } = useDispatch('core/block-editor');

	const onUpdate = useCallback(
		(checkDuplicates) => {
			let { blockId } = attributes;

			if (!blockId || checkDuplicates) {
				const usedIds = {};

				// prevent unique ID duplication after block duplicated.
				if (checkDuplicates) {
					allBlocks.forEach((data) => {
						if (
							data.clientId &&
							data.attributes &&
							data.attributes.blockId
						) {
							usedIds[data.attributes.blockId] = data.clientId;

							if (
								data.clientId !== clientId &&
								data.attributes.blockId === blockId
							) {
								blockId = '';
							}
						}
					});
				}

				// prepare new block id.
				if (clientId && !blockId && typeof blockId !== 'undefined') {
					let ID = blockId || '';

					// check if ID already exist.
					let tryCount = 10;
					while (
						!ID ||
						(typeof usedIds[ID] !== 'undefined' &&
							usedIds[ID] !== clientId &&
							tryCount > 0)
					) {
						ID = shorthash.unique(clientId);
						tryCount -= 1;
					}

					if (ID && typeof usedIds[ID] === 'undefined') {
						usedIds[ID] = clientId;
					}

					if (ID !== blockId) {
						const newClass = `${name.replace('/', '-')}-${ID}`;

						/**
						 * IMPORTANT!
						 * We can't use `setAttributes` here because it is not working correctly
						 * when we duplicate multiple blocks at once. `updateBlockAttributes` resolves this issue.
						 *
						 * @see https://github.com/nk-crew/lazy-blocks/issues/32#issuecomment-2681280713
						 */
						updateBlockAttributes(clientId, {
							blockId: ID,
							blockUniqueClass: newClass,
						});
					}
				}
			}
		},
		[attributes, clientId, allBlocks, name, updateBlockAttributes]
	);

	const onUpdateThrottle = useThrottle(onUpdate, 60);

	useEffect(() => {
		if (!blockSettings.lazyblock) {
			return;
		}

		// Did update.
		if (didMountRef.current) {
			onUpdateThrottle();

			// Did mount.
		} else {
			didMountRef.current = true;

			onUpdate(true);
		}
	}, [blockSettings, attributes, onUpdate, onUpdateThrottle]);
}

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom styles if needed.
 *
 * @param {Function} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withBlockId = createHigherOrderComponent(
	(BlockEdit) => (props) => {
		useBlockID(props);

		return <BlockEdit {...props} />;
	},
	'withBlockId'
);

addFilter('editor.BlockEdit', 'lazyblocks/blockId', withBlockId);
