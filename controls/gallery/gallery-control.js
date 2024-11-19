/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	ButtonGroup,
	Tooltip,
	DropZone,
	withNotices,
} from '@wordpress/components';
import { MediaPlaceholder, MediaUpload } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

const ALLOWED_MEDIA_TYPES = ['image'];

function GalleryControl(props) {
	const {
		label,
		value,
		previewSize,
		noticeOperations,
		noticeUI,
		controlProps,
		onChange = () => {},
	} = props;

	const { mediaUpload, imagesPreviewData } = useSelect((select) => {
		const { getMedia } = select('core');

		const preview = {};

		if (value && Object.keys(value).length) {
			value.forEach((img) => {
				if (!preview[img.id]) {
					const mediaImg = getMedia(img.id) || false;

					if (mediaImg) {
						preview[img.id] = {
							alt: mediaImg.alt_text,
							url: mediaImg.source_url,
						};

						if (
							mediaImg.media_details &&
							mediaImg.media_details.sizes &&
							mediaImg.media_details.sizes[previewSize]
						) {
							preview[img.id].url =
								mediaImg.media_details.sizes[
									previewSize
								].source_url;
						}
					}
				}
			});
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
							onClick={open}
							role="presentation"
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
							<ButtonGroup className="lzb-gutenberg-gallery-button">
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
							</ButtonGroup>
							{value.map((img) => (
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
						</div>
					)}
				/>
			) : null}
		</BaseControl>
	);
}

export default withNotices(GalleryControl);
