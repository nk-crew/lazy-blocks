/**
 * Styles.
 */
import './editor.scss';

/**
 * External dependencies.
 */
import slugify from 'slugify';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useRef, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

const REGEXP_NEWLINES = /[\r\n]+/g;

export default function TitleSettings(props) {
	const textareaRef = useRef();

	const { data, updateData } = props;
	const { slug } = data;

	const { postTitle } = useSelect((select) => {
		const { getEditedPostAttribute } = select('core/editor');

		return {
			postTitle: getEditedPostAttribute('title'),
		};
	}, []);

	const { editPost } = useDispatch('core/editor');

	function updatePostTitle(title) {
		editPost({ title });
	}

	function maybeAddSlug() {
		if (slug || !postTitle) {
			return;
		}

		const newSlug = slugify(postTitle, {
			replacement: '-',
			lower: true,
			remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
		});

		updateData({
			slug: newSlug,
		});
	}

	// Set automatic height.
	useEffect(() => {
		if (textareaRef.current) {
			// We need to reset the height momentarily to get the correct scrollHeight for the textarea
			textareaRef.current.style.height = '0px';
			const scrollHeight = textareaRef.current.scrollHeight;

			// We then set the height directly, outside of the render loop
			// Trying to set this with state or a ref will product an incorrect value.
			textareaRef.current.style.height = `${scrollHeight}px`;
		}
	}, [textareaRef, postTitle]);

	return (
		<div className="lzb-constructor-title">
			<textarea
				ref={textareaRef}
				placeholder={__('Block Name', 'lazy-blocks')}
				value={postTitle}
				onChange={(e) => {
					updatePostTitle(
						e.target.value.replace(REGEXP_NEWLINES, ' ')
					);
				}}
				onBlur={() => maybeAddSlug()}
			/>
		</div>
	);
}
