/* eslint-disable react/no-unused-state */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { MediaPlaceholder } from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	DropZone,
	withNotices,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

const ALLOWED_MEDIA_TYPES = ['image'];

function ImageControl(props) {
	const {
		label,
		value,
		previewSize,
		allowInsertFromURL,
		help,
		noticeOperations,
		noticeUI,
		onChange = () => {},
	} = props;

	const { mediaUpload, imagePreviewData } = useSelect((select) => {
		const { getMedia } = select('core');

		let preview = false;

		if (value && Object.keys(value).length) {
			if (value.id) {
				const mediaImg = getMedia(value.id) || false;

				if (mediaImg) {
					preview = {
						alt: mediaImg.alt_text,
						url: mediaImg.source_url,
					};

					if (
						mediaImg.media_details &&
						mediaImg.media_details.sizes &&
						mediaImg.media_details.sizes[previewSize]
					) {
						preview.url =
							mediaImg.media_details.sizes[
								previewSize
							].source_url;
					}
				}
			} else if (value.url) {
				preview = {
					url: value.url,
				};
			}
		}

		return {
			mediaUpload: select('core/block-editor').getSettings().mediaUpload,
			imagePreviewData: preview,
		};
	});

	function onUploadError(message) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice(message);
	}

	return (
		<BaseControl
			id={label}
			label={label}
			help={help}
			__nextHasNoMarginBottom
		>
			<div className="lzb-gutenberg-image-wrap">
				{!value || !Object.keys(value).length ? (
					<MediaPlaceholder
						icon={
							<svg
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z" />
							</svg>
						}
						labels={{
							title: label,
							name: __('image', 'lazy-blocks'),
						}}
						onSelect={(image) => {
							onChange(image);
						}}
						onSelectURL={
							allowInsertFromURL
								? (url) => {
										onChange({ url });
									}
								: null
						}
						notices={noticeUI}
						accept="image/*"
						allowedTypes={ALLOWED_MEDIA_TYPES}
						disableMaxUploadErrorMessages
						onError={(message) => onUploadError(message)}
					/>
				) : (
					''
				)}
				{value && Object.keys(value).length ? (
					<div className="lzb-gutenberg-image">
						<DropZone
							onFilesDrop={(files) => {
								mediaUpload({
									allowedTypes: ALLOWED_MEDIA_TYPES,
									filesList: files,
									onFileChange: (image) => {
										onChange(image[0]);
									},
									onError: (message) => {
										noticeOperations.createErrorNotice(
											message
										);
									},
								});
							}}
						/>
						<div className="lzb-gutenberg-image-button">
							<Button
								variant="secondary"
								size="small"
								onClick={() => {
									onChange('');
								}}
							>
								{__('Remove Image', 'lazy-blocks')}
							</Button>
						</div>
						<div
							className="lzb-gutenberg-image-item"
							key={value.id || value.url}
						>
							{imagePreviewData.url ? (
								<img
									src={imagePreviewData.url}
									alt={imagePreviewData.alt}
								/>
							) : (
								''
							)}
						</div>
					</div>
				) : (
					''
				)}
			</div>
		</BaseControl>
	);
}

export default withNotices(ImageControl);
