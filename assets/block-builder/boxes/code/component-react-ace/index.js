/**
 * Styles.
 */
import './editor.scss';

/**
 * External dependencies.
 */
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-github_light_default';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-handlebars';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/snippets/css';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/snippets/text';
import 'ace-builds/src-noconflict/snippets/html';
import 'ace-builds/src-noconflict/snippets/handlebars';
import 'ace-builds/src-noconflict/snippets/php';
import 'ace-builds/src-noconflict/ext-emmet';

import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';

/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, memo } from '@wordpress/element';
import { select } from '@wordpress/data';

import FixCssFrame from '../fix-css-frame';

/**
 * Helper function to create completers for different editor types.
 *
 * @param {string}   editorId         - The ID of the editor.
 * @param {string}   triggerChar      - The character that triggers autocompletion.
 * @param {Function} formatSuggestion - Function to format the suggestion.
 */
const createControlsCompleter = (editorId, triggerChar, formatSuggestion) => {
	addCompleter({
		getCompletions(editor, session, pos, prefix, callback) {
			try {
				if (editor.id === editorId) {
					const { getBlockData } = select('lazy-blocks/block-data');
					const blockData = getBlockData();

					if (blockData?.controls) {
						const result = [];

						Object.keys(blockData.controls).forEach((k) => {
							const control = blockData.controls[k];

							if (control.name && !control.child_of) {
								result.push({
									caption: formatSuggestion(control.name),
									value: formatSuggestion(control.name),
									meta: sprintf(
										// translators: %1$s - control name.
										__('Control "%1$s"', 'lazy-blocks'),
										control.label
									),
								});
							}
						});

						if (result.length) {
							callback(null, result);
						} else {
							callback(null, []);
						}
					} else {
						callback(null, []);
					}
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Error in autocomplete:', error);
				callback(null, []);
			}
		},
		identifierRegexps: [new RegExp(triggerChar)],
	});
};

// Add PHP autocompleter with control names.
createControlsCompleter(
	'lzb-editor-php',
	'\\$',
	(name) => `$attributes['${name}']`
);

// Add HTML autocompleter with control names.
createControlsCompleter('lzb-editor-html', '\\{', (name) => `{{${name}}}`);

// Add CSS autocompleter with block classname.
addCompleter({
	getCompletions(editor, session, pos, prefix, callback) {
		try {
			if (editor.id === 'lzb-editor-css') {
				const { getBlockData } = select('lazy-blocks/block-data');
				const blockData = getBlockData();

				const result = [];

				const slugWithNamespace = (
					blockData.slug.includes('/')
						? blockData.slug
						: `lazyblock/${blockData.slug}`
				).replace('/', '-');
				const blockClassName = `wp-block-${slugWithNamespace}`;

				result.push({
					caption: `.${blockClassName}`,
					value: `.${blockClassName}`,
					meta: __('Block Class', 'lazy-blocks'),
				});

				if (result.length) {
					callback(null, result);
				} else {
					callback(null, []);
				}
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error in autocomplete:', error);
			callback(null, []);
		}
	},
	identifierRegexps: [new RegExp('.')],
});

/**
 * Code editor component that wraps AceEditor with additional functionality.
 *
 * @param {Object} props component props.
 */
function CodeEditor(props) {
	const $editorWrapper = useRef();

	useEffect(() => {
		const $frame = $editorWrapper.current;

		// Prevent propagating cut event to Gutenberg.
		// @see https://github.com/nk-crew/lazy-blocks/pull/226
		function handleCut(event) {
			event.stopPropagation();
		}

		$frame.addEventListener('cut', handleCut);

		return () => {
			$frame.removeEventListener('cut', handleCut);
		};
	}, []);

	return (
		<div
			ref={$editorWrapper}
			className="lazyblocks-component-code-editor-wrapper"
			role="application"
			aria-label={__('Code Editor', 'lazy-blocks')}
		>
			<AceEditor
				theme="github_light_default"
				onLoad={(editor) => {
					editor.renderer.setScrollMargin(16, 16, 16, 16);
					editor.renderer.setPadding(16);
				}}
				fontSize={12}
				showPrintMargin
				showGutter
				width="100%"
				className="lazyblocks-component-code-editor"
				{...props}
				maxLines={Infinity}
				editorProps={{
					$blockScrolling: Infinity,
					...(props.editorProps || {}),
				}}
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true,
					enableEmmet: true,
					showLineNumbers: true,
					highlightActiveLine: true,
					tabSize: 2,
					useWorker: false,
					...(props.setOptions || {}),
				}}
			/>
			<FixCssFrame />
		</div>
	);
}

export default memo(CodeEditor);
