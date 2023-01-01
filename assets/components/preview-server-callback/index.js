/**
 * External dependencies.
 */
import deepEqual from 'deep-equal';

/**
 * WordPress dependencies.
 */
const { Spinner } = wp.components;

const { useEffect, useState, useRef, RawHTML, Fragment } = wp.element;

const { __, sprintf } = wp.i18n;

const { apiFetch } = wp;

const { doAction, applyFilters } = wp.hooks;

const { useSelect } = wp.data;

const { usePrevious } = wp.compose;

/**
 * Block Editor custom PHP preview.
 *
 * Based on ServerSideRender
 * https://github.com/WordPress/gutenberg/blob/master/packages/components/src/server-side-render/index.js
 */
export default function PreviewServerCallback(props) {
  const {
    block,
    attributes = null,
    urlQueryArgs = {},
    onBeforeChange = () => {},
    onChange = () => {},
  } = props;

  const [response, setResponse] = useState(null);
  const [onChanged, setOnChanged] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [allowRender, setAllowRender] = useState(true);

  const isMountedRef = useRef(true);
  const currentFetchRequest = useRef(null);
  const fetchTimeout = useRef();

  const prevProps = usePrevious(props);

  const { postId } = useSelect((select) => {
    const { getCurrentPostId } = select('core/editor') || {};

    return {
      postId: getCurrentPostId ? getCurrentPostId() : 0,
    };
  }, []);

  function updateResponse(data) {
    setResponse(data);
    setOnChanged(onChanged + 1);
  }

  function fetchData() {
    if (!isMountedRef.current) {
      return;
    }

    setIsLoading(true);

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
      .then((res) => {
        if (!isMountedRef.current) {
          return;
        }

        if (fetchRequest === currentFetchRequest.current) {
          onBeforeChange();
          doAction('lzb.components.PreviewServerCallback.onBeforeChange', props);
          doAction('lazyblocks.components.PreviewServerCallback.onBeforeChange', props);

          if (res && res.success) {
            updateResponse(res.response);
          } else if (res && !res.success && res.error_code) {
            if (res.error_code === 'lazy_block_invalid') {
              updateResponse(null);
            } else if (res.error_code === 'lazy_block_no_render_callback') {
              updateResponse(null);
              setAllowRender(false);
            }
          }
        }

        setIsLoading(false);
      })
      .catch((res) => {
        if (!isMountedRef.current) {
          return;
        }

        if (fetchRequest === currentFetchRequest.current) {
          onBeforeChange();
          doAction('lzb.components.PreviewServerCallback.onBeforeChange', props);
          doAction('lazyblocks.components.PreviewServerCallback.onBeforeChange', props);

          updateResponse({
            error: true,
            response: res,
          });
        }

        setIsLoading(false);
      });

    currentFetchRequest.current = fetchRequest;
  }

  const debouncedFetchData = () => {
    // Clear the previous timeout.
    clearTimeout(fetchTimeout.current);

    fetchTimeout.current = setTimeout(() => {
      fetchData();
    }, 500);
  };

  // When the component unmounts, set isMountedRef to false. This will
  // let the async fetch callbacks know when to stop.
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!allowRender) {
      return;
    }

    // Filter to allow custom providers to disable fetching. Used in the Pro blocks preloading feature.
    // Forward everything from this component to filter.
    const allowFetch = applyFilters('lzb.components.PreviewServerCallback.allowFetch', true, {
      props,
      prevProps,
      response,
      setResponse: updateResponse,
      isLoading,
      setIsLoading,
      allowRender,
      setAllowRender,
      isMountedRef,
      currentFetchRequest,
      postId,
      fetchData,
      debouncedFetchData,
    });

    if (!allowFetch) {
      return;
    }

    // Don't debounce the first fetch. This ensures that the first render
    // shows data as soon as possible
    if (prevProps === undefined) {
      fetchData();
    } else if (!deepEqual(prevProps.attributes, props.attributes)) {
      debouncedFetchData();
    }
  });

  // Handle callbacks and events when response changed.
  useEffect(() => {
    // Prevent initial render call.
    if (!onChanged) {
      return;
    }

    onChange();
    doAction('lzb.components.PreviewServerCallback.onChange', props);
    doAction('lazyblocks.components.PreviewServerCallback.onChange', props);
  }, [onChanged]);

  let result = '';

  if (!allowRender) {
    result = '';
  } else if (response && response.error) {
    // translators: %s: error message describing the problem
    const errorMessage = sprintf(
      __('Error loading block preview: %s', 'lazy-blocks'),
      response.response.message || response.response.code || response.response
    );
    result = errorMessage;
  } else {
    result = (
      <Fragment>
        {response ? <RawHTML>{response}</RawHTML> : ''}
        {isLoading ? <Spinner /> : ''}
      </Fragment>
    );
  }

  return <div className="lzb-preview-server">{result}</div>;
}
