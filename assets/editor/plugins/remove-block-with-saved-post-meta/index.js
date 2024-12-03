import './index.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { differenceWith } from 'lodash';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';
import { Button, ToggleControl } from '@wordpress/components';
import { usePrevious } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

import Modal from '../../../components/modal';
import useAllBlocks from '../../../hooks/use-all-blocks';

let options = window.lazyblocksGutenberg;
if (!options?.blocks?.length) {
	options = {
		post_type: 'post',
		blocks: [],
		controls: {},
	};
}

function RemoveBlockWithSavedMeta() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [savedMetaNames, setMetaNames] = useState([]);

	const allBlocks = useAllBlocks();
	const prevAllBlocks = usePrevious(allBlocks);

	const postType = useSelect(
		(select) => select('core/editor')?.getCurrentPostType?.(),
		[]
	);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	// Memoize blocks with meta controls
	const blocksWithMetaControls = useMemo(() => {
		return options.blocks.filter((block) =>
			Object.values(block.controls).some(
				(control) => control.save_in_meta === 'true'
			)
		);
	}, []);

	const handleMetaToggle = useCallback((index, value) => {
		setMetaNames((prev) =>
			prev.map((prevMeta, i) =>
				i === index ? { ...prevMeta, checked: value } : prevMeta
			)
		);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		const metaToDelete = savedMetaNames.reduce((acc, savedMeta) => {
			if (savedMeta.checked) {
				acc[savedMeta.metaName] = null;
			}

			return acc;
		}, {});

		if (Object.keys(metaToDelete).length) {
			setMeta(metaToDelete);
		}

		setIsModalOpen(false);
	}, [savedMetaNames, setMeta]);

	const handleCancel = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	useEffect(() => {
		if (!prevAllBlocks) {
			return;
		}

		const removedBlocks = differenceWith(
			prevAllBlocks,
			allBlocks,
			(el1, el2) => el1.clientId === el2.clientId
		);

		if (!removedBlocks.length) {
			return;
		}

		const savedSlugs = blocksWithMetaControls.map((block) => block.slug);

		const processRemovedBlocks = () => {
			const uniqueMetaNames = new Set();

			const metaNames = removedBlocks
				.filter((block) => savedSlugs.includes(block.name))
				.flatMap((block) => {
					const savedBlock = blocksWithMetaControls.find(
						(saved) => saved.slug === block.name
					);

					return Object.values(savedBlock.controls)
						.filter((control) => control.save_in_meta === 'true')
						.map((control) => ({
							metaName: control.save_in_meta_name || control.name,
							label: control.label,
							default: control.default,
							checked: false,
						}))
						.filter((control) => {
							if (uniqueMetaNames.has(control.metaName)) {
								return false;
							}

							uniqueMetaNames.add(control.metaName);

							return true;
						});
				})
				.filter((m) => {
					const metaValue = meta[m.metaName];

					return (
						metaValue !== m.default &&
						metaValue !== undefined &&
						metaValue !== null &&
						metaValue !== ''
					);
				});

			if (metaNames?.length) {
				setMetaNames(metaNames);
				setIsModalOpen(true);
			}
		};

		processRemovedBlocks();
	}, [meta, allBlocks, prevAllBlocks, blocksWithMetaControls]);

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
					key={currentMeta.metaName}
					label={currentMeta.label}
					checked={currentMeta.checked}
					onChange={(value) => handleMetaToggle(index, value)}
					__nextHasNoMarginBottom
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

export default RemoveBlockWithSavedMeta;
