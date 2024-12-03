/**
 * WordPress dependencies.
 */
import { useEffect, useRef } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';

export default function DeselectActiveControlOnClickOutside() {
	const ref = useRef();

	useEffect(() => {
		const element = ref.current;

		if (!element) {
			return;
		}

		const doc = element.ownerDocument;

		if (!doc) {
			return;
		}

		const maybeDeselect = (e) => {
			const selectedControlId = select(
				'lazy-blocks/block-data'
			).getSelectedControlId();

			if (!selectedControlId) {
				return;
			}

			// click outside of content.
			if (
				!e.target.closest(
					'.edit-post-layout__content, .editor-styles-wrapper'
				)
			) {
				return;
			}

			// click on notice.
			if (e.target.closest('.components-notice-list')) {
				return;
			}

			// click on control.
			if (e.target.closest('.lzb-block-builder-controls-item')) {
				return;
			}

			// click on code box.
			if (e.target.closest('.lazyblocks-component-box')) {
				return;
			}

			// click on add control button.
			if (
				e.target.classList.contains(
					'lzb-block-builder-controls-item-appender'
				)
			) {
				return;
			}

			const { clearSelectedControl } = dispatch('lazy-blocks/block-data');

			// clear selected control.
			clearSelectedControl();
		};

		doc.addEventListener('click', maybeDeselect);

		return () => {
			doc.removeEventListener('click', maybeDeselect);
		};
	}, [ref]);

	return <link ref={ref} />;
}
