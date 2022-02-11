import slugify from 'slugify';
import TextareaAutosize from 'react-autosize-textarea';

import './editor.scss';

const { __ } = wp.i18n;

const { Component, createRef } = wp.element;

const { compose } = wp.compose;

const { withSelect, withDispatch } = wp.data;

const REGEXP_NEWLINES = /[\r\n]+/g;

class TitleSettings extends Component {
  constructor(...args) {
    super(...args);

    this.textareaRef = createRef();
    this.maybeAddSlug = this.maybeAddSlug.bind(this);
  }

  maybeAddSlug() {
    const { data, updateData, postTitle } = this.props;

    const { slug } = data;

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

  render() {
    const self = this;
    const { postTitle, updatePostTitle } = self.props;

    return (
      <div className="lzb-constructor-title">
        <TextareaAutosize
          ref={this.textareaRef}
          placeholder={__('Block Name', '@@text_domain')}
          value={postTitle}
          onChange={(e) => {
            updatePostTitle(e.target.value.replace(REGEXP_NEWLINES, ' '));
          }}
          onBlur={() => this.maybeAddSlug()}
        />
      </div>
    );
  }
}

export default compose([
  withSelect((select) => {
    const { getEditedPostAttribute } = select('core/editor');

    return {
      postTitle: getEditedPostAttribute('title'),
    };
  }),
  withDispatch((dispatch) => {
    const { editPost } = dispatch('core/editor');

    return {
      updatePostTitle(title) {
        editPost({ title });
      },
    };
  }),
])(TitleSettings);
