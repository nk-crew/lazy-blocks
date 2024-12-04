/**
 * Styles.
 */
import './editor.scss';

/**
 * External dependencies.
 */
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/snippets/css';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/snippets/text';
import 'ace-builds/src-noconflict/snippets/html';
import 'ace-builds/src-noconflict/snippets/php';

import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';

/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { select } from '@wordpress/data';

import FixCssFrame from '../fix-css-frame';

// Add autocompleter with control names.
addCompleter({
	getCompletions(editor, session, pos, prefix, callback) {
		if (editor.id === 'lzb-editor-php') {
			const { getBlockData } = select('lazy-blocks/block-data');

			const blockData = getBlockData();

			if (blockData.controls) {
				const result = [];

				Object.keys(blockData.controls).forEach((k) => {
					const control = blockData.controls[k];

					if (control.name && !control.child_of) {
						result.push({
							caption: `$attributes['${control.name}']`,
							value: `$attributes['${control.name}']`,
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
				}
			}
		}
	},
	identifierRegexps: [/\$/],
});

addCompleter({
	getCompletions(editor, session, pos, prefix, callback) {
		if (editor.id === 'lzb-editor-html') {
			const { getBlockData } = select('lazy-blocks/block-data');

			const blockData = getBlockData();

			if (blockData.controls) {
				const result = [];

				Object.keys(blockData.controls).forEach((k) => {
					const control = blockData.controls[k];

					if (control.name && !control.child_of) {
						result.push({
							caption: `{{${control.name}}}`,
							value: `{{${control.name}}}`,
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
				}
			}
		}
	},
	identifierRegexps: [/\{/],
});

export default function CodeEditor(props) {
	const $editorWrapper = useRef();

	function handleCut(event) {
		event.stopPropagation();
	}

	useEffect(() => {
		const $frame = $editorWrapper.current;

		$frame.addEventListener('cut', handleCut);

		return () => {
			$frame.removeEventListener('cut', handleCut);
		};
	}, []);

	return (
		<div ref={$editorWrapper}>
			<AceEditor
				theme="textmate"
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
				editorProps={{
					$blockScrolling: Infinity,
					...(props.editorProps || {}),
				}}
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true,
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
