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

import useAllBlocks from '../../hooks/use-all-blocks';

// Track recently generated IDs across all block instances
const recentlyGeneratedIds = new Set();

function useBlockID(props) {
	const { setAttributes, attributes, clientId, name } = props;
	const blockSettings = getBlockType(name);
	const didMountRef = useRef(false);
	const previousBlockIdRef = useRef(attributes.blockId);

	const allBlocks = useAllBlocks();

	const generateUniqueId = useCallback((baseId, usedIds) => {
		// Generate a unique ID that's not in usedIds or recentlyGeneratedIds
		let newId = '';
		let tryCount = 10;

		while (tryCount > 0) {
			newId = shorthash.unique(baseId + tryCount);

			if (!usedIds[newId] && !recentlyGeneratedIds.has(newId)) {
				break;
			}

			tryCount -= 1;
		}

		// Add to recently generated IDs to prevent duplicates in batch operations
		// @link https://github.com/nk-crew/lazy-blocks/issues/32#issuecomment-2681280713
		recentlyGeneratedIds.add(newId);

		// Clean up old IDs after a short delay to prevent memory leaks
		setTimeout(() => {
			recentlyGeneratedIds.delete(newId);
		}, 1000);

		return newId;
	}, []);

	const onUpdate = useCallback(
		(checkDuplicates) => {
			const { blockId } = attributes;
			const isDuplicated =
				blockId && blockId !== previousBlockIdRef.current;

			// Always check for duplicates when the block might be duplicated
			if (!blockId || checkDuplicates || isDuplicated) {
				const usedIds = {};

				// Collect all used IDs from existing blocks
				allBlocks.forEach((data) => {
					if (
						data.clientId &&
						data.attributes &&
						data.attributes.blockId
					) {
						usedIds[data.attributes.blockId] = data.clientId;
					}
				});

				// Check if current ID is duplicate or needs to be generated
				const needsNewId =
					!blockId ||
					(blockId &&
						usedIds[blockId] &&
						usedIds[blockId] !== clientId) ||
					isDuplicated;

				if (clientId && needsNewId) {
					// Generate a new unique ID based on clientId plus some randomness
					const ID = generateUniqueId(clientId, usedIds);

					if (ID && ID !== blockId) {
						const newClass = `${name.replace('/', '-')}-${ID}`;

						setAttributes({
							blockId: ID,
							blockUniqueClass: newClass,
						});

						// Update the reference to the current blockId
						previousBlockIdRef.current = ID;
					}
				}
			}
		},
		[attributes, clientId, allBlocks, name, setAttributes, generateUniqueId]
	);

	// Reduce throttle time to ensure quicker updates
	const onUpdateThrottle = useThrottle(onUpdate, 30);

	useEffect(() => {
		if (!blockSettings.lazyblock) {
			return;
		}

		// Did update.
		if (didMountRef.current) {
			onUpdateThrottle();
		} else {
			// Did mount.
			didMountRef.current = true;

			// Always check for duplicates on mount
			onUpdate(true);
		}

		// Update the previous blockId reference
		previousBlockIdRef.current = attributes.blockId;
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
