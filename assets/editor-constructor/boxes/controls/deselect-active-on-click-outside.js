/**
 * WordPress dependencies.
 */
import { useContext, useEffect } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';
import { BlockList } from '@wordpress/block-editor';

const { elementContext: __stableElementContext, __unstableElementContext } =
	BlockList;

const elementContext = __stableElementContext || __unstableElementContext;

export default function DeselectActiveControlOnClickOutside() {
	const element = useContext(elementContext);

	useEffect(() => {
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
			if (e.target.closest('.lzb-constructor-controls-item')) {
				return;
			}

			// click on code box.
			if (e.target.closest('.lazyblocks-component-box')) {
				return;
			}

			// click on add control button.
			if (
				e.target.classList.contains(
					'lzb-constructor-controls-item-appender'
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
	}, [element]);

	return null;
}
