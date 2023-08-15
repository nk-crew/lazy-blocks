/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent, useThrottle } from '@wordpress/compose';

function useBlockID(props) {
	const { setAttributes, attributes, clientId, name } = props;
	const blockSettings = getBlockType(name);
	const didMountRef = useRef(false);

	const { getBlocks } = useSelect((select) => {
		return select('core/block-editor');
	});

	/**
	 * Get recursive all blocks of the current page
	 *
	 * @param {boolean} blocks - block list
	 *
	 * @return {Array} block list
	 */
	const getAllBlocks = useCallback(
		(blocks = false) => {
			let result = [];

			if (!blocks) {
				blocks = getBlocks();
			}

			if (!blocks) {
				return result;
			}

			blocks.forEach((data) => {
				result.push(data);

				if (data.innerBlocks && data.innerBlocks.length) {
					result = [...result, ...getAllBlocks(data.innerBlocks)];
				}
			});

			return result;
		},
		[getBlocks]
	);

	const onUpdate = useCallback(
		(checkDuplicates) => {
			let { blockId } = attributes;

			if (!blockId || checkDuplicates) {
				const usedIds = {};

				// prevent unique ID duplication after block duplicated.
				if (checkDuplicates) {
					const allBlocks = getAllBlocks();
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

						setAttributes({
							blockId: ID,
							blockUniqueClass: newClass,
						});
					}
				}
			}
		},
		[attributes, clientId, getAllBlocks, name, setAttributes]
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
