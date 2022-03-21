// External Dependencies.
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
import 'ace-builds/src-noconflict/ext-language_tools';

// Import CSS
import './editor.scss';

const { useEffect, useRef } = wp.element;

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
        highlightActiveLine={false}
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
          tabSize: 2,
          useWorker: false,
          ...(props.setOptions || {}),
        }}
      />
    </div>
  );
}
