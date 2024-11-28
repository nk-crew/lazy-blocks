import './index.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { differenceWith, isEqual } from 'lodash';
import { subscribe, select, dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { Button, ToggleControl, Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

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
	const [errorNotice, setError] = useState(false);

	useEffect(() => {
		const getBlockList = () => select('core/block-editor').getBlocks();
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
				newBlockList.length < blockList.length
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
									checked: false,
									uniqueKey: metaName, // Use a unique identifier for each control
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
						const metaValue =
							select('core/editor').getEditedPostAttribute(
								'meta'
							)[metaName];

						return (
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
	}, []);

	const deletePostMeta = async (postId, metaKey) => {
		try {
			await apiFetch({
				path: 'lazy-blocks/v1/delete-post-meta',
				method: 'POST',
				data: {
					post_id: postId,
					meta_key: metaKey,
				},
			});
		} catch (error) {
			const errorMessage = sprintf(
				// Translators: %s - error text.
				__('Error deleting meta: %s', 'lazy-blocks'),
				error.message
			);

			await setError(errorMessage);
		}
	};

	const handleConfirmDelete = async () => {
		const postId = select('core/editor').getCurrentPostId();

		// Delete meta fields based on toggles
		for (const meta of await savedMetaNames) {
			if (await meta.checked) {
				const metaName = meta.saveInMetaName || meta.metaName;

				const currentMeta =
					await select('core/editor').getCurrentPostAttribute('meta');

				const updatedMeta = {
					...currentMeta,
					[metaName]: null,
				};

				// Update the post meta
				await dispatch('core/editor').editPost({ meta: updatedMeta });

				await deletePostMeta(postId, metaName);
			}
		}

		if (!errorNotice) {
			setIsModalOpen(false);
		}
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
					{errorNotice ? (
						<>
							<Notice status="error" isDismissible={false}>
								{errorNotice}
							</Notice>
						</>
					) : null}
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
					{savedMetaNames.map((meta, index) => (
						<ToggleControl
							key={index}
							label={meta.label}
							checked={meta.checked}
							onChange={(value) => {
								const updatedMetaNames = [...savedMetaNames];
								updatedMetaNames[index] = {
									...meta,
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
