// External Dependencies.
import AceEditor from 'react-ace';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/snippets/css';
import 'brace/snippets/javascript';
import 'brace/snippets/text';
import 'brace/snippets/html';
import 'brace/ext/language_tools';

// Import CSS
import './editor.scss';

const { Component } = wp.element;

export default class CodeEditor extends Component {
    render() {
        return (
            <AceEditor
                theme="textmate"
                onLoad={ ( editor ) => {
                    editor.renderer.setScrollMargin( 16, 16, 16, 16 );
                    editor.renderer.setPadding( 16 );
                } }
                fontSize={ 12 }
                showPrintMargin={ true }
                showGutter={ true }
                highlightActiveLine={ false }
                width="100%"
                setOptions={ {
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                } }
                editorProps={ {
                    $blockScrolling: Infinity,
                } }
                className="lazyblocks-component-code-editor"
                { ...this.props }
            />
        );
    }
}
