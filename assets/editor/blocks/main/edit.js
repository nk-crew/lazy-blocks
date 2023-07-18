/* eslint-disable no-param-reassign */
/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useRef, useEffect } from '@wordpress/element';
import { ToolbarButton } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { useThrottle } from '@wordpress/compose';
import {
	InspectorControls,
	useBlockProps,
	BlockControls,
} from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import PreviewServerCallback from '../../../components/preview-server-callback';
import RenderControls from '../../../components/render-controls';
import getControlValue from '../../../utils/get-control-value';
import isControlValueValid from '../../../utils/is-control-value-valid';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
	options = {
		post_type: 'post',
		blocks: [],
		controls: {},
	};
}

export default function BlockEdit(props) {
	const { lazyBlockData, clientId, isSelected, attributes } = props;

	const isFirstLoad = useRef(true);
	const isMounted = useRef(true);

	const { innerBlockSelected, postType } = useSelect(
		(select) => {
			const { hasSelectedInnerBlock } = select('core/block-editor');

			// This select is not available in the Widgets editor, so we have to check it.
			const { getCurrentPostType } = select('core/editor') || {};

			return {
				innerBlockSelected: hasSelectedInnerBlock(clientId, true),
				postType: getCurrentPostType && getCurrentPostType(),
			};
		},
		[clientId]
	);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	const isLazyBlockSelected = isSelected || innerBlockSelected;

	const {
		lockPostSaving: lockPostSavingDispatch,
		unlockPostSaving: unlockPostSavingDispatch,
	} = useDispatch('core/editor') || {};

	function lockPostSaving() {
		// We should check this because of Widget screen does not have this feature
		// https://github.com/WordPress/gutenberg/issues/33756
		if (lockPostSavingDispatch) {
			lockPostSavingDispatch(`lazyblock-${clientId}`);
		}
	}
	function unlockPostSaving() {
		// We should check this because of Widget screen does not have this feature
		// https://github.com/WordPress/gutenberg/issues/33756
		if (unlockPostSavingDispatch) {
			unlockPostSavingDispatch(`lazyblock-${clientId}`);
		}
	}

	/**
	 * Lock post saving if some controls are not valid.
	 */
	function maybeLockPostSaving() {
		let shouldLock = 0;
		let thereIsRequired = false;

		// Prevent if component already unmounted.
		if (!isMounted.current) {
			return;
		}

		// check all controls
		Object.keys(lazyBlockData.controls).forEach((k) => {
			const control = lazyBlockData.controls[k];

			if (control.required && control.required === 'true') {
				thereIsRequired = true;

				// Child controls.
				if (control.child_of) {
					if (lazyBlockData.controls[control.child_of]) {
						const childs = getControlValue(
							attributes,
							meta,
							lazyBlockData,
							lazyBlockData.controls[control.child_of]
						);

						if (childs && childs.length) {
							childs.forEach((childData, childIndex) => {
								const val = getControlValue(
									attributes,
									meta,
									lazyBlockData,
									control,
									childIndex
								);

								if (!isControlValueValid(val, control)) {
									shouldLock += 1;
								}
							});
						}
					}

					// Single controls.
				} else {
					const val = getControlValue(
						attributes,
						meta,
						lazyBlockData,
						control
					);

					if (!isControlValueValid(val, control)) {
						shouldLock += 1;
					}
				}
			}
		});

		// no required controls available.
		if (!thereIsRequired) {
			return;
		}

		// lock or unlock post saving depending on required controls values.
		if (shouldLock > 0) {
			lockPostSaving();
		} else {
			unlockPostSaving();
		}
	}

	const maybeLockPostSavingThrottle = useThrottle(maybeLockPostSaving, 500);

	useEffect(() => {
		// Run throttle when attributes changed.
		if (!isFirstLoad.current) {
			maybeLockPostSavingThrottle();
		}
	}, [attributes, maybeLockPostSavingThrottle]);

	useEffect(() => {
		isFirstLoad.current = false;

		// Try to lock post once component mounted.
		maybeLockPostSaving();

		// Unlock once component unmounted (mostly when block removed).
		return () => {
			isMounted.current = false;

			unlockPostSaving();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { blockUniqueClass = '' } = attributes;

	const className = classnames('lazyblock', blockUniqueClass);

	const attsForRender = {};

	// prepare data for preview.
	Object.keys(lazyBlockData.controls).forEach((k) => {
		if (!lazyBlockData.controls[k].child_of) {
			attsForRender[lazyBlockData.controls[k].name] = getControlValue(
				attributes,
				meta,
				lazyBlockData,
				lazyBlockData.controls[k]
			);
		}
	});

	// reserved attributes.
	const reservedAttributes = [
		'lazyblock',
		'className',
		'align',
		'anchor',
		'blockId',
		'blockUniqueClass',
	];
	reservedAttributes.forEach((attr) => {
		attsForRender[attr] = attributes[attr];
	});

	// show code preview
	let showPreview = true;

	switch (lazyBlockData.code.show_preview) {
		case 'selected':
			showPreview = isLazyBlockSelected;
			break;
		case 'unselected':
			showPreview = !isLazyBlockSelected;
			break;
		case 'never':
			showPreview = false;
			break;
		// no default
	}

	return (
		<div {...useBlockProps({ className })}>
			<div className="lzb-content-title">
				{lazyBlockData.icon && /^dashicons/.test(lazyBlockData.icon) ? (
					<span className={lazyBlockData.icon} />
				) : null}
				{lazyBlockData.icon &&
				!/^dashicons/.test(lazyBlockData.icon) ? (
					// eslint-disable-next-line react/no-danger
					<span
						dangerouslySetInnerHTML={{ __html: lazyBlockData.icon }}
					/>
				) : null}

				<h6>{lazyBlockData.title}</h6>
			</div>
			<InspectorControls>
				<div
					className="lzb-inspector-controls"
					data-lazyblocks-block-name={props.name}
				>
					<RenderControls
						placement="inspector"
						isLazyBlockSelected={isLazyBlockSelected}
						meta={meta}
						setMeta={(...args) => {
							if (postType) {
								setMeta(...args);
							}
						}}
						{...props}
					/>
				</div>
			</InspectorControls>
			{lazyBlockData.edit_url ? (
				<BlockControls group="other">
					<ToolbarButton
						icon={
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M10.2894 4.8356C10.3698 4.35341 10.787 4 11.2758 4H12.5816C13.0704 4 13.4876 4.35341 13.5679 4.8356L13.8083 6.27728C14.6162 6.53233 15.3503 6.95375 15.9703 7.50134L17.3131 6.99826C17.7709 6.82676 18.2856 7.01136 18.53 7.4347L19.1829 8.56551C19.4273 8.98886 19.3298 9.52686 18.9524 9.83755L17.8658 10.7321C17.9537 11.1408 18 11.565 18 12C18 12.4348 17.9537 12.8588 17.8659 13.2674L18.9534 14.1627C19.3308 14.4734 19.4283 15.0114 19.1839 15.4347L18.531 16.5655C18.2866 16.9889 17.7719 17.1735 17.3142 17.002L15.9704 16.4986C15.3503 17.0462 14.6162 17.4677 13.8083 17.7227L13.5679 19.1644C13.4876 19.6466 13.0704 20 12.5816 20H11.2758C10.787 20 10.3698 19.6466 10.2894 19.1644L10.0408 17.6729C9.27409 17.4081 8.57776 16.9923 7.98745 16.461L6.5433 17.002C6.08553 17.1735 5.57087 16.9889 5.32645 16.5655L4.67358 15.4347C4.42916 15.0114 4.52663 14.4734 4.90404 14.1627L6.11343 13.1671C6.03901 12.7896 6 12.3993 6 12C6 11.6005 6.03905 11.2101 6.11353 10.8325L4.90501 9.83755C4.52761 9.52686 4.43014 8.98886 4.67456 8.56551L5.32743 7.4347C5.57185 7.01136 6.08651 6.82676 6.54428 6.99826L7.98755 7.53896C8.57784 7.00768 9.27413 6.59188 10.0408 6.32714L10.2894 4.8356ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
									fill="currentColor"
								/>
							</svg>
						}
						label={__('Edit Block', '@@text_domain')}
						href={lazyBlockData.edit_url.replace('&amp;', '&')}
						target="_blank"
						rel="noopener noreferrer"
					/>
				</BlockControls>
			) : null}
			<div
				className="lzb-content-controls"
				data-lazyblocks-block-name={props.name}
			>
				<RenderControls
					placement="content"
					isLazyBlockSelected={isLazyBlockSelected}
					meta={meta}
					setMeta={(...args) => {
						if (postType) {
							setMeta(...args);
						}
					}}
					{...props}
				/>
			</div>
			{showPreview ? (
				<PreviewServerCallback
					block={lazyBlockData.slug}
					clientId={clientId}
					attributes={attsForRender}
				/>
			) : null}
		</div>
	);
}
