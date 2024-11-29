import './index.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { differenceWith } from 'lodash';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { Button, ToggleControl } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

import Modal from '../../../components/modal';
import useAllBlocks from '../../../hooks/use-all-blocks';

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
	const allBlocks = useAllBlocks();
	const prevAllBlocks = usePrevious(allBlocks);

	const { postType } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor') || {};

		return {
			postType: getCurrentPostType && getCurrentPostType(),
		};
	}, []);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	useEffect(() => {
		if (!prevAllBlocks) {
			return;
		}

		// Ensure we only trigger on actual block removals
		const removedBlocks = differenceWith(
			prevAllBlocks,
			allBlocks,
			(el1, el2) => {
				return el1.clientId === el2.clientId;
			}
		);

		if (!removedBlocks.length) {
			return;
		}

		// Get all metadata entries with enabled save flags.
		const blocksWithMetaControls = options.blocks.filter((block) => {
			return Object.values(block.controls).some(
				(control) => control.save_in_meta === 'true'
			);
		});
		const savedSlugs = blocksWithMetaControls.map((block) => block.slug);

		// Filtering deleted blocks, extracting only saved meta from them.
		const filteredBlocks = removedBlocks
			.filter((block) => savedSlugs.includes(block.name))
			.map((block) => {
				const savedBlock = blocksWithMetaControls.find(
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
				const metaName = control.saveInMetaName || control.metaName;

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
	}, [meta, allBlocks, prevAllBlocks]);

	const handleConfirmDelete = () => {
		const metaToDelete = {};

		// Delete meta fields based on toggles
		for (const savedMeta of savedMetaNames) {
			if (savedMeta.checked) {
				const metaName = savedMeta.saveInMetaName || savedMeta.metaName;

				metaToDelete[metaName] = null;
			}
		}

		// Update the post meta
		if (Object.keys(metaToDelete).length) {
			setMeta(metaToDelete);
		}

		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	if (!isModalOpen || !savedMetaNames.length) {
		return null;
	}

	return (
		<Modal
			title={__('Remove post meta used by this block?', 'lazy-blocks')}
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
	);
}
