/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';

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
 * @param {Function} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withUniqueBlockId = createHigherOrderComponent(
	(BlockEdit) =>
		function NewEdit(props) {
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

					if (
						newBlockId &&
						typeof usedIds[newBlockId] === 'undefined'
					) {
						usedIds[newBlockId] = clientId;
					}

					if (newBlockId !== blockId) {
						const newClass = `${name.replace(
							'/',
							'-'
						)}-${newBlockId}`;

						setAttributes({
							blockId: newBlockId,
							blockUniqueClass: newClass,
						});
					}
				}
			}

			useEffect(() => {
				// fix duplicated classes after block clone.
				if (
					clientId &&
					attributes.blockId &&
					typeof usedIds[attributes.blockId] === 'undefined'
				) {
					usedIds[attributes.blockId] = clientId;
				}
			}, [attributes.blockId, clientId]);

			useEffect(() => {
				maybeCreateBlockId();
			});

			return <BlockEdit {...props} />;
		},
	'withUniqueBlockId'
);

addFilter('editor.BlockEdit', 'lazyblocks/uniqueBlockId', withUniqueBlockId);
