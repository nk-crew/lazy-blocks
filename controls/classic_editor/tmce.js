/**
 * TinyMCE Component from https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/freeform/edit.js
 * With changes to work as control.
 */

/**
 * WordPress dependencies
 */
const { wp } = window;

const { Component } = wp.element;

const { __ } = wp.i18n;

const { BACKSPACE, DELETE, F10 } = wp.keycodes;

function isTmceEmpty(editor) {
  // When tinyMce is empty the content seems to be:
  // <p><br data-mce-bogus="1"></p>
  // avoid expensive checks for large documents
  const body = editor.getBody();
  if (1 < body.childNodes.length) {
    return false;
  }
  if (0 === body.childNodes.length) {
    return true;
  }
  if (1 < body.childNodes[0].childNodes.length) {
    return false;
  }
  return /^\n?$/.test(body.innerText || body.textContent);
}

export default class ClassicEdit extends Component {
  constructor(props) {
    super(props);
    this.initialize = this.initialize.bind(this);
    this.onSetup = this.onSetup.bind(this);
    this.focus = this.focus.bind(this);
  }

  componentDidMount() {
    const { baseURL, suffix } = window.wpEditorL10n ? window.wpEditorL10n.tinymce : window.tinymce;

    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix,
    });

    if ('complete' === document.readyState) {
      this.initialize();
    } else {
      document.addEventListener('readystatechange', this.initialize);
    }
  }

  componentDidUpdate(prevProps) {
    const { content, onChange } = this.props;

    if (prevProps.content !== content) {
      onChange(content || '');
    }
  }

  componentWillUnmount() {
    document.removeEventListener('readystatechange', this.initialize);
    wp.oldEditor.remove(`editor-${this.props.editorId}`);
  }

  onSetup(editor) {
    const { content, onChange } = this.props;

    const { ref } = this;
    let bookmark;

    this.editor = editor;

    if (content) {
      editor.on('loadContent', () => editor.setContent(content));
    }

    editor.on('blur', () => {
      bookmark = editor.selection.getBookmark(2, true);

      onChange(editor.getContent());

      editor.once('focus', () => {
        if (bookmark) {
          editor.selection.moveToBookmark(bookmark);
        }
      });

      return false;
    });

    editor.on('change', () => {
      onChange(editor.getContent());
    });

    editor.on('mousedown touchstart', () => {
      bookmark = null;
    });

    editor.on('keydown', (event) => {
      if ((event.keyCode === BACKSPACE || event.keyCode === DELETE) && isTmceEmpty(editor)) {
        // delete the block
        this.props.onReplace([]);
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      const { altKey } = event;
      /*
       * Prevent Mousetrap from kicking in: TinyMCE already uses its own
       * `alt+f10` shortcut to focus its toolbar.
       */
      if (altKey && event.keyCode === F10) {
        event.stopPropagation();
      }
    });

    // Show the second, third, etc. toolbars when the `kitchensink` button is removed by a plugin.
    editor.on('init', () => {
      if (editor.settings.toolbar1 && -1 === editor.settings.toolbar1.indexOf('kitchensink')) {
        editor.dom.addClass(ref, 'has-advanced-toolbar');
      }
    });

    editor.addButton('wp_add_media', {
      tooltip: __('Insert Media', 'lazy-blocks'),
      icon: 'dashicon dashicons-admin-media',
      cmd: 'WP_Medialib',
    });
    // End TODO.

    editor.on('init', () => {
      const rootNode = this.editor.getBody();

      // Create the toolbar by refocussing the editor.
      if (document.activeElement === rootNode) {
        rootNode.blur();
        this.editor.focus();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onToolbarKeyDown(event) {
    // Prevent WritingFlow from kicking in and allow arrows navigation on the toolbar.
    event.stopPropagation();
    // Prevent Mousetrap from moving focus to the top toolbar when pressing `alt+f10` on this block toolbar.
    event.nativeEvent.stopImmediatePropagation();
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  initialize() {
    const { editorId } = this.props;
    const { settings } = window.wpEditorL10n ? window.wpEditorL10n.tinymce : window.tinymce;

    wp.oldEditor.initialize(`editor-${editorId}`, {
      tinymce: {
        ...settings,
        inline: true,
        content_css: false,
        fixed_toolbar_container: `#toolbar-${editorId}`,
        setup: this.onSetup,
      },
    });
  }

  render() {
    const { editorId } = this.props;

    // Disable reasons:
    //
    // jsx-a11y/no-static-element-interactions
    //  - the toolbar itself is non-interactive, but must capture events
    //    from the KeyboardShortcuts component to stop their propagation.

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return [
      <div
        key="toolbar"
        id={`toolbar-${editorId}`}
        ref={(ref) => {
          this.ref = ref;
        }}
        className="block-library-classic__toolbar"
        onClick={this.focus}
        data-placeholder={__('Classic', 'lazy-blocks')}
        onKeyDown={this.onToolbarKeyDown}
      />,
      <div key="editor" id={`editor-${editorId}`} className="block-library-rich-text__tinymce" />,
    ];
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}
