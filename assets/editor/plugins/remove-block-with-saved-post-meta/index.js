import './index.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { differenceWith, isEqual } from 'lodash';
import { subscribe, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import Modal from '../../../components/modal';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
	options = {
		post_type: 'post',
		blocks: [],
		controls: {},
	};
}

export default function RemoveBlockWithSavedMeta() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [savedMetaNames, setMetaNames] = useState([]);

	const { postType, getBlockList } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor') || {};
		const { getBlocks } = select('core/block-editor') || [];

		return {
			postType: getCurrentPostType && getCurrentPostType(),
			getBlockList: getBlocks,
		};
	}, []);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	useEffect(() => {
		let blockList = getBlockList();

		/**
		 * TODO: We need update this code once Gutenberg adds delete button functionality.
		 * The feature is currently under discussion at https://github.com/WordPress/gutenberg/issues/58390
		 * We currently detect deleted blocks after they are removed, which triggers the modal window.
		 */
		const unsubscribe = subscribe(() => {
			const newBlockList = getBlockList();
			const removedBlocks = differenceWith(
				blockList,
				newBlockList,
				isEqual
			);

			// Make sure that blocks were removed and not added.
			if (
				removedBlocks.length > 0 &&
				(newBlockList.length < blockList.length ||
					(newBlockList.length === blockList.length &&
						blockList.length === 1))
			) {
				// We gather a list of all metadata entries where the save flag is enabled.
				const findBlocksWithSaveInMeta = (blocks) => {
					return blocks.filter((block) => {
						return Object.values(block.controls).some(
							(control) => control.save_in_meta === 'true'
						);
					});
				};

				const blocksWithSaveInMeta = findBlocksWithSaveInMeta(
					options.blocks
				);
				const savedSlugs = blocksWithSaveInMeta.map(
					(block) => block.slug
				);

				// Filtering deleted blocks, extracting only saved meta from them.
				const filteredBlocks = removedBlocks
					.filter((block) => savedSlugs.includes(block.name))
					.map((block) => {
						const savedBlock = blocksWithSaveInMeta.find(
							(saved) => saved.slug === block.name
						);

						const controlsWithSaveInMeta = Object.values(
							savedBlock.controls
						).filter((control) => control.save_in_meta === 'true');

						return {
							...block,
							controlsWithSaveInMeta,
						};
					});

				if (filteredBlocks.length) {
					// Create a Set to track unique meta identifiers
					const uniqueMetaNames = new Set();

					// Fill array to display toggle meta in modal window list.
					const metaNames = filteredBlocks
						.flatMap((block) =>
							block.controlsWithSaveInMeta.map((control) => {
								const metaName =
									control.save_in_meta_name || control.name;
								return {
									metaName: control.name,
									saveInMetaName: control.save_in_meta_name,
									label: control.label,
									default: control.default,
									uniqueKey: metaName, // Use a unique identifier for each control
									checked: false,
								};
							})
						)
						.filter((control) => {
							// Use the Set to filter out duplicates
							if (uniqueMetaNames.has(control.uniqueKey)) {
								return false;
							}
							uniqueMetaNames.add(control.uniqueKey);
							return true;
						});

					// Set the defined flag if the saved metadata exists and contains values.
					const isAnyMetaDefined = metaNames.some((control) => {
						const metaName =
							control.saveInMetaName || control.metaName;

						const metaValue = meta[metaName];

						return (
							metaValue !== control.default &&
							metaValue !== undefined &&
							metaValue !== null &&
							metaValue !== ''
						);
					});

					if (isAnyMetaDefined) {
						setIsModalOpen(true);
						setMetaNames(metaNames);
					}
				}
			}
			blockList = newBlockList;
		});

		return () => {
			unsubscribe();
		};
	}, [meta, getBlockList]);

	const handleConfirmDelete = () => {
		let updatedMeta = {
			...meta,
		};
		// Delete meta fields based on toggles
		for (const savedMeta of savedMetaNames) {
			if (savedMeta.checked) {
				const metaName = savedMeta.saveInMetaName || savedMeta.metaName;

				updatedMeta = {
					...updatedMeta,
					[metaName]: null,
				};
			}
		}

		// Update the post meta
		setMeta(updatedMeta);

		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			{isModalOpen && savedMetaNames.length && (
				<Modal
					title={__(
						'Remove post meta used by this block?',
						'lazy-blocks'
					)}
					onRequestClose={handleCancel}
					size="medium"
				>
					<p style={{ marginTop: 0 }}>
						{__(
							'This block created metadata that is still saved in your post.',
							'lazy-blocks'
						)}
						<br />
						{__(
							'Would you like to remove any of these meta fields?',
							'lazy-blocks'
						)}
					</p>
					<p>{__('Select post meta to remove:', 'lazy-blocks')}</p>
					{savedMetaNames.map((currentMeta, index) => (
						<ToggleControl
							key={index}
							label={currentMeta.label}
							checked={currentMeta.checked}
							onChange={(value) => {
								const updatedMetaNames = [...savedMetaNames];
								updatedMetaNames[index] = {
									...currentMeta,
									checked: value,
								};
								setMetaNames(updatedMetaNames);
							}}
						/>
					))}
					<div className="lzb-gutenberg-remove-post-meta-modal-buttons">
						<Button
							variant="primary"
							onClick={handleConfirmDelete}
							disabled={!savedMetaNames.some((m) => m.checked)}
						>
							{__('Remove selected Meta', 'lazy-blocks')}
						</Button>
						<Button variant="link" onClick={handleCancel}>
							{__('Cancel', 'lazy-blocks')}
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
}
