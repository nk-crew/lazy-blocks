/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

const STYLE_IDS = [
	'autocompletion.css',
	'snippets.css',
	'error_marker.css',
	'ace-tm',
	'ace_editor.css',
	'ace_scrollbar.css',
];

export default function FixCssFrame(props) {
	// Find available styles and save it to the state.
	useEffect(() => {
		const element = props.codeWrapper.current;

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
	}, [props]);

	return null;
}
