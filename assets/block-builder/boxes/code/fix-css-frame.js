/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

const STYLE_IDS = [
	'autocompletion.css',
	'snippets.css',
	'error_marker.css',
	'ace-tm',
	'ace_editor.css',
	'ace_scrollbar.css',
];

export default function FixCssFrame() {
	const codeWrapper = useRef();

	// Find available styles and save it to the state.
	useEffect(() => {
		const element = codeWrapper.current;

		if (!element) {
			return;
		}

		// Don't run this fix if not inside iframe.
		if (element.ownerDocument === document) {
			return;
		}

		const documentFrame = element.ownerDocument;

		STYLE_IDS.forEach((id) => {
			const styleTag = document.getElementById(id);

			if (!styleTag) {
				return;
			}

			const frameStyleTag = documentFrame.getElementById(id);

			if (frameStyleTag) {
				return;
			}

			documentFrame.head.appendChild(styleTag.cloneNode(true));
		});
	}, [codeWrapper]);

	return <link ref={codeWrapper} />;
}
