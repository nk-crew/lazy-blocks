import slugify from 'slugify';
import TextareaAutosize from 'react-autosize-textarea';

import './editor.scss';

const { __ } = wp.i18n;

const { useRef } = wp.element;

const { useSelect, useDispatch } = wp.data;

const REGEXP_NEWLINES = /[\r\n]+/g;

export default function TitleSettings(props) {
  const textareaRef = useRef();

  const { data, updateData } = props;
  const { slug } = data;

  const { postTitle } = useSelect((select) => {
    const { getEditedPostAttribute } = select('core/editor');

    return {
      postTitle: getEditedPostAttribute('title'),
    };
  }, []);

  const { editPost } = useDispatch('core/editor');

  function updatePostTitle(title) {
    editPost({ title });
  }

  function maybeAddSlug() {
    if (slug || !postTitle) {
      return;
    }

    const newSlug = slugify(postTitle, {
      replacement: '-',
      lower: true,
      remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
    });

    updateData({
      slug: newSlug,
    });
  }

  return (
    <div className="lzb-constructor-title">
      <TextareaAutosize
        ref={textareaRef}
        placeholder={__('Block Name', 'lazy-blocks')}
        value={postTitle}
        onChange={(e) => {
          updatePostTitle(e.target.value.replace(REGEXP_NEWLINES, ' '));
        }}
        onBlur={() => maybeAddSlug()}
      />
    </div>
  );
}
