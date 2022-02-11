/**
 * External dependencies.
 */
import { debounce } from 'throttle-debounce';
import deepEqual from 'deep-equal';

/**
 * WordPress dependencies.
 */
const { Spinner } = wp.components;

const { Component, RawHTML, Fragment } = wp.element;

const { __, sprintf } = wp.i18n;

const { apiFetch } = wp;

const { doAction } = wp.hooks;

const { withSelect } = wp.data;

/**
 * Block Editor custom PHP preview.
 *
 * Based on ServerSideRender
 * https://github.com/WordPress/gutenberg/blob/master/packages/components/src/server-side-render/index.js
 */
class PreviewServerCallback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: null,
      previousResponse: null,
      allowRender: true,
    };
  }

  componentDidMount() {
    this.isStillMounted = true;
    this.fetch(this.props);
    // Only debounce once the initial fetch occurs to ensure that the first
    // renders show data as soon as possible.
    this.fetch = debounce(500, this.fetch);
  }

  componentDidUpdate(prevProps) {
    const prevAttributes = prevProps.attributes;
    const curAttributes = this.props.attributes;

    if (this.state.allowRender && !deepEqual(prevAttributes, curAttributes)) {
      this.fetch(this.props);
    }
  }

  componentWillUnmount() {
    this.isStillMounted = false;
  }

  fetch(props) {
    if (!this.isStillMounted) {
      return;
    }

    if (this.state.response !== null) {
      this.setState({ response: null });
    }

    const {
      block,
      attributes = null,
      post_id: postId,
      urlQueryArgs = {},
      onBeforeChange = () => {},
      onChange = () => {},
    } = props;

    // Store the latest fetch request so that when we process it, we can
    // check if it is the current request, to avoid race conditions on slow networks.
    const fetchRequest = apiFetch({
      path: 'lazy-blocks/v1/block-render',
      method: 'POST',
      data: {
        context: 'editor',
        name: block,
        post_id: postId || 0,
        ...(attributes !== null ? { attributes } : {}),
        ...urlQueryArgs,
      },
    })
      .then((response) => {
        if (this.isStillMounted && fetchRequest === this.currentFetchRequest) {
          onBeforeChange();
          doAction('lzb.components.PreviewServerCallback.onBeforeChange', this.props);
          doAction('lazyblocks.components.PreviewServerCallback.onBeforeChange', this.props);

          if (response && response.success) {
            this.setState(
              {
                response: response.response,
                previousResponse: response.response,
              },
              () => {
                onChange();
                doAction('lzb.components.PreviewServerCallback.onChange', this.props);
                doAction('lazyblocks.components.PreviewServerCallback.onChange', this.props);
              }
            );
          } else if (response && !response.success && response.error_code) {
            if (response.error_code === 'lazy_block_invalid') {
              this.setState(
                {
                  response: null,
                  previousResponse: null,
                },
                () => {
                  onChange();
                  doAction('lzb.components.PreviewServerCallback.onChange', this.props);
                  doAction('lazyblocks.components.PreviewServerCallback.onChange', this.props);
                }
              );
            } else if (response.error_code === 'lazy_block_no_render_callback') {
              this.setState(
                {
                  response: null,
                  previousResponse: null,
                  allowRender: false,
                },
                () => {
                  onChange();
                  doAction('lzb.components.PreviewServerCallback.onChange', this.props);
                  doAction('lazyblocks.components.PreviewServerCallback.onChange', this.props);
                }
              );
            }
          }
        }
      })
      .catch((response) => {
        if (this.isStillMounted && fetchRequest === this.currentFetchRequest) {
          onBeforeChange();
          doAction('lzb.components.PreviewServerCallback.onBeforeChange', this.props);
          doAction('lazyblocks.components.PreviewServerCallback.onBeforeChange', this.props);

          this.setState(
            {
              response: {
                error: true,
                response,
              },
            },
            () => {
              onChange();
              doAction('lzb.editor.PreviewServerCallback.onChange', this.props);
              doAction('lazyblocks.components.PreviewServerCallback.onChange', this.props);
            }
          );
        }
      });

    this.currentFetchRequest = fetchRequest;
  }

  render() {
    const { response, previousResponse } = this.state;
    let result = '';

    if (!this.state.allowRender) {
      result = '';
    } else if (response === null) {
      result = (
        <Fragment>
          {previousResponse ? <RawHTML key="html">{previousResponse}</RawHTML> : ''}
          <Spinner />
        </Fragment>
      );
    } else if (response.error) {
      // translators: %s: error message describing the problem
      const errorMessage = sprintf(
        __('Error loading block preview: %s', '@@text_domain'),
        response.response
      );
      result = errorMessage;
    } else {
      result = <RawHTML key="html">{response}</RawHTML>;
    }

    return <div className="lzb-preview-server">{result}</div>;
  }
}

export default withSelect((select) => {
  const { getCurrentPostId } = select('core/editor') || {};

  return {
    post_id: getCurrentPostId ? getCurrentPostId() : 0,
  };
})(PreviewServerCallback);
