/**
 * WordPress dependencies.
 */

import { MediaPlaceholder, MediaUpload } from '@wordpress/block-editor';
import { Button, DropZone, Tooltip, withNotices } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useLayoutEffect, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

const ALLOWED_MEDIA_TYPES = ['image'];

// Only the visible images are requested, so this is reached with large preview
// grids only. The REST API limits the `per_page` argument to 100 items.
const MAX_IMAGES_PER_REQUEST = 100;

// The control is just a preview, the gallery itself is edited in the media
// modal, so we render a limited grid and count the rest in the last item.
export const DEFAULT_PREVIEW_ROWS = 4;
export const MAX_PREVIEW_ROWS = 20;
export const MAX_PREVIEW_COLUMNS = 20;

// Used when the columns count is calculated from the control width.
const MIN_COLUMN_WIDTH = 62;
const MIN_AUTO_COLUMNS = 2;
const MAX_AUTO_COLUMNS = 8;

const ITEM_GAP = 10;

// Preview items are tiny, so there is no need to load anything sharper than
// a retina item.
const PREVIEW_PIXEL_RATIO = 2;

/**
 * Parse a setting which limits the preview grid.
 *
 * @param {string|number} value - raw setting value.
 * @param {number}        max   - highest allowed value.
 *
 * @return {number} - sanitized value, 0 when the setting is not set.
 */
function parseLimit(value, max) {
	const parsed = parseInt(value, 10);

	if (Number.isNaN(parsed) || parsed < 1) {
		return 0;
	}

	return Math.min(parsed, max);
}

/**
 * Calculate the number of preview columns which fit the given container width.
 *
 * @param {number} width - container width in pixels.
 *
 * @return {number} - columns count, 0 when the width is not measured yet.
 */
function getAutoColumnsCount(width) {
	if (!width) {
		return 0;
	}

	return Math.min(
		MAX_AUTO_COLUMNS,
		Math.max(MIN_AUTO_COLUMNS, Math.floor(width / MIN_COLUMN_WIDTH))
	);
}

/**
 * Find the smallest registered image size which still looks sharp in a preview
 * item, so the control never downloads a full size image.
 *
 * @param {Object} mediaImg - attachment record.
 * @param {number} itemWidth - rendered preview item width in pixels.
 *
 * @return {string} - image URL.
 */
function getPreviewImageUrl(mediaImg, itemWidth) {
	const sizes =
		mediaImg.media_details && mediaImg.media_details.sizes
			? Object.values(mediaImg.media_details.sizes).filter(
					(size) => size && size.source_url && size.width
				)
			: [];

	if (!sizes.length) {
		return mediaImg.source_url;
	}

	const targetWidth = itemWidth * PREVIEW_PIXEL_RATIO;
	const covering = sizes.filter((size) => size.width >= targetWidth);

	const picked = covering.length
		? covering.reduce((a, b) => (a.width < b.width ? a : b))
		: sizes.reduce((a, b) => (a.width > b.width ? a : b));

	return picked.source_url;
}

function GalleryControl(props) {
	const {
		label,
		value,
		previewRows,
		previewColumns,
		noticeOperations,
		noticeUI,
		controlProps,
		onChange = () => {},
	} = props;

	const [galleryNode, setGalleryNode] = useState(null);
	const [containerWidth, setContainerWidth] = useState(0);

	useLayoutEffect(() => {
		if (!galleryNode) {
			return;
		}

		const measure = () => {
			setContainerWidth(galleryNode.offsetWidth);
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(galleryNode);

		return () => observer.disconnect();
	}, [galleryNode]);

	const rows =
		parseLimit(previewRows, MAX_PREVIEW_ROWS) || DEFAULT_PREVIEW_ROWS;
	const columns =
		parseLimit(previewColumns, MAX_PREVIEW_COLUMNS) ||
		getAutoColumnsCount(containerWidth);

	const images = value && value.length ? value : [];

	// Nothing is rendered until the control is measured, which happens in a
	// layout effect, before the browser paints. Bailing out early also keeps
	// the media library request below limited to the visible images.
	const previewLimit = containerWidth ? columns * rows : 0;
	const hasHiddenImages = previewLimit > 0 && images.length > previewLimit;

	// The last item is replaced with the "+N" counter.
	const previewImages = images.slice(
		0,
		hasHiddenImages ? previewLimit - 1 : previewLimit
	);
	const hiddenImagesCount = hasHiddenImages
		? images.length - previewImages.length
		: 0;

	// Items are laid out by `assets/editor/index.scss` using the columns count
	// and a fixed gap.
	const itemWidth = columns ? containerWidth / columns - ITEM_GAP : 0;

	const { mediaUpload, imagesPreviewData } = useSelect((select) => {
		const { getEntityRecords } = select('core');

		const preview = {};

		if (previewImages.length) {
			// Images may be stored without an ID (added by URL),
			// such images can't be requested from the media library.
			const ids = [
				...new Set(previewImages.map((img) => img.id).filter(Boolean)),
			];

			for (let i = 0; i < ids.length; i += MAX_IMAGES_PER_REQUEST) {
				const chunk = ids.slice(i, i + MAX_IMAGES_PER_REQUEST);

				const mediaItems = getEntityRecords('postType', 'attachment', {
					include: chunk,
					per_page: chunk.length,
				});

				(mediaItems || []).forEach((mediaImg) => {
					preview[mediaImg.id] = {
						alt: mediaImg.alt_text,
						url: getPreviewImageUrl(mediaImg, itemWidth),
					};
				});
			}
		}

		return {
			mediaUpload: select('core/block-editor').getSettings().mediaUpload,
			imagesPreviewData: preview,
		};
	});

	function onUploadError(message) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	}

	return (
		<BaseControl {...useBlockControlProps(controlProps)}>
			{!value || !Object.keys(value).length ? (
				<MediaPlaceholder
					icon="format-gallery"
					labels={{
						title: label,
						name: __('images', 'lazy-blocks'),
					}}
					onSelect={(images) => {
						onChange(images);
					}}
					notices={noticeUI}
					accept="image/*"
					allowedTypes={ALLOWED_MEDIA_TYPES}
					disableMaxUploadErrorMessages
					multiple
					onError={(message) => onUploadError(message)}
				/>
			) : null}
			{value && Object.keys(value).length ? (
				<MediaUpload
					onSelect={(images) => {
						onChange(images);
					}}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					multiple
					gallery
					value={value.map((img) => img.id)}
					render={({ open }) => (
						<div
							className="lzb-gutenberg-gallery"
							style={{ '--lzb-gallery-columns': columns || null }}
							onClick={open}
							role="presentation"
							ref={setGalleryNode}
						>
							<DropZone
								onFilesDrop={(files) => {
									const currentImages = value || [];
									mediaUpload({
										allowedTypes: ALLOWED_MEDIA_TYPES,
										filesList: files,
										onFileChange: (images) => {
											onChange(
												currentImages.concat(images)
											);
										},
										onError: (message) => {
											noticeOperations.createErrorNotice(
												message
											);
										},
									});
								}}
							/>
							<div
								role="group"
								aria-label={__(
									'Gallery actions',
									'lazy-blocks'
								)}
								className="components-button-group lzb-gutenberg-gallery-button"
							>
								<Button
									variant="secondary"
									size="compact"
									className="lzb-gutenberg-gallery-button-edit"
								>
									{__('Edit Gallery', 'lazy-blocks')}
								</Button>
								<Tooltip
									text={__(
										'Clear the gallery',
										'lazy-blocks'
									)}
								>
									<Button
										variant="secondary"
										size="compact"
										className="lzb-gutenberg-gallery-button-remove"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											onChange([]);
										}}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M3 6h18" />
											<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
											<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
											<line
												x1="10"
												x2="10"
												y1="11"
												y2="17"
											/>
											<line
												x1="14"
												x2="14"
												y1="11"
												y2="17"
											/>
										</svg>
									</Button>
								</Tooltip>
							</div>
							{previewImages.map((img) => (
								<div
									className="lzb-gutenberg-gallery-item"
									key={img.id || img.url}
								>
									{imagesPreviewData[img.id] &&
									imagesPreviewData[img.id].url ? (
										<img
											src={imagesPreviewData[img.id].url}
											alt={imagesPreviewData[img.id].alt}
										/>
									) : (
										''
									)}
								</div>
							))}
							{hiddenImagesCount > 0 ? (
								<div
									className="lzb-gutenberg-gallery-item lzb-gutenberg-gallery-item-more"
									title={sprintf(
										/* translators: %d: number of images which are not displayed in the preview. */
										_n(
											'%d more image',
											'%d more images',
											hiddenImagesCount,
											'lazy-blocks'
										),
										hiddenImagesCount
									)}
								>
									<span>+{hiddenImagesCount}</span>
								</div>
							) : null}
						</div>
					)}
				/>
			) : null}
		</BaseControl>
	);
}

export default withNotices(GalleryControl);
