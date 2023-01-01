/* eslint-disable no-underscore-dangle */
/**
 * TinyMCE Component from https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/freeform/edit.js
 * With changes to work as control.
 */

/**
 * External dependencies
 */
import { debounce } from 'throttle-debounce';

/**
 * WordPress dependencies
 */
const { wp } = window;

const { useEffect, useRef } = wp.element;

const { __ } = wp.i18n;

const { F10, isKeyboardEvent } = wp.keycodes;

export default function ClassicEdit(props) {
  const { editorId, content, onChange } = props;

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      return;
    }

    const editor = window.tinymce.get(`editor-${editorId}`);
    const currentContent = editor?.getContent();

    if (currentContent !== content) {
      editor.setContent(content || '');
    }
  }, [content]);

  useEffect(() => {
    const { baseURL, suffix } = window.wpEditorL10n.tinymce;
    // const { baseURL, suffix } = window.wpEditorL10n ? window.wpEditorL10n.tinymce : window.tinymce;

    didMount.current = true;

    window.tinymce.EditorManager.overrideDefaults({
      base_url: baseURL,
      suffix,
    });

    function onSetup(editor) {
      let bookmark;

      if (content) {
        editor.on('loadContent', () => editor.setContent(content));
      }

      editor.on('blur', () => {
        bookmark = editor.selection.getBookmark(2, true);
        // There is an issue with Chrome and the editor.focus call in core at https://core.trac.wordpress.org/browser/trunk/src/js/_enqueues/lib/link.js#L451.
        // This causes a scroll to the top of editor content on return from some content updating dialogs so tracking
        // scroll position until this is fixed in core.
        const scrollContainer = document.querySelector('.interface-interface-skeleton__content');
        const scrollPosition = scrollContainer.scrollTop;

        editor.once('focus', () => {
          if (bookmark) {
            editor.selection.moveToBookmark(bookmark);
            if (scrollContainer.scrollTop !== scrollPosition) {
              scrollContainer.scrollTop = scrollPosition;
            }
          }
        });

        return false;
      });

      editor.on('mousedown touchstart', () => {
        bookmark = null;
      });

      const debouncedOnChange = debounce(250, () => {
        const value = editor.getContent();

        if (value !== editor._lastChange) {
          editor._lastChange = value;
          onChange(value);
        }
      });
      editor.on('Paste Change input Undo Redo', debouncedOnChange);

      // We need to cancel the debounce call because when we remove
      // the editor (onUnmount) this callback is executed in
      // another tick. This results in setting the content to empty.
      editor.on('remove', debouncedOnChange.cancel);

      editor.on('keydown', (event) => {
        if (isKeyboardEvent.primary(event, 'z')) {
          // Prevent the gutenberg undo kicking in so TinyMCE undo stack works as expected.
          event.stopPropagation();
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

      editor.on('init', () => {
        const rootNode = editor.getBody();

        // Create the toolbar by refocussing the editor.
        if (rootNode.ownerDocument.activeElement === rootNode) {
          rootNode.blur();
          editor.focus();
        }
      });
    }

    function initialize() {
      const { settings } = window.wpEditorL10n.tinymce;
      wp.oldEditor.initialize(`editor-${editorId}`, {
        tinymce: {
          ...settings,
          inline: true,
          content_css: false,
          fixed_toolbar_container: `#toolbar-${editorId}`,
          setup: onSetup,
        },
      });
    }

    function onReadyStateChange() {
      if (document.readyState === 'complete') {
        initialize();
      }
    }

    if (document.readyState === 'complete') {
      initialize();
    } else {
      document.addEventListener('readystatechange', onReadyStateChange);
    }

    return () => {
      document.removeEventListener('readystatechange', onReadyStateChange);
      wp.oldEditor.remove(`editor-${editorId}`);
    };
  }, []);

  function focus() {
    const editor = window.tinymce.get(`editor-${editorId}`);
    if (editor) {
      editor.focus();
    }
  }

  function onToolbarKeyDown(event) {
    // Prevent WritingFlow from kicking in and allow arrows navigation on the toolbar.
    event.stopPropagation();
    // Prevent Mousetrap from moving focus to the top toolbar when pressing `alt+f10` on this block toolbar.
    event.nativeEvent.stopImmediatePropagation();
  }

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
      className="block-library-classic__toolbar"
      onClick={focus}
      data-placeholder={__('Classic', 'lazy-blocks')}
      onKeyDown={onToolbarKeyDown}
    />,
    <div key="editor" id={`editor-${editorId}`} className="block-library-rich-text__tinymce" />,
  ];
  /* eslint-enable jsx-a11y/no-static-element-interactions */
}
