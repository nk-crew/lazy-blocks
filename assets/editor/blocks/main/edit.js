/* eslint-disable no-param-reassign */
// External Dependencies.
import classnames from 'classnames/dedupe';

import PreviewServerCallback from '../../../components/preview-server-callback';
import RenderControls from '../../../components/render-controls';
import getControlValue from '../../../utils/get-control-value';
import isControlValueValid from '../../../utils/is-control-value-valid';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
  options = {
    post_type: 'post',
    blocks: [],
    controls: {},
  };
}

const { __ } = wp.i18n;

const { useRef, useEffect } = wp.element;

const { Tooltip } = wp.components;

const { useSelect, useDispatch } = wp.data;

const { useThrottle } = wp.compose;

const { InspectorControls, useBlockProps } = wp.blockEditor;

export default function BlockEdit(props) {
  const { lazyBlockData, clientId, isSelected, attributes } = props;

  const isFirstLoad = useRef(true);
  const isMounted = useRef(true);

  const { innerBlockSelected } = useSelect((select) => {
    const { hasSelectedInnerBlock } = select('core/block-editor');

    return {
      innerBlockSelected: hasSelectedInnerBlock(clientId, true),
    };
  }, []);

  const isLazyBlockSelected = isSelected || innerBlockSelected;

  const { lockPostSaving: lockPostSavingDispatch, unlockPostSaving: unlockPostSavingDispatch } =
    useDispatch('core/editor') || {};

  function lockPostSaving() {
    // We should check this because of Widget screen does not have this feature
    // https://github.com/WordPress/gutenberg/issues/33756
    if (lockPostSavingDispatch) {
      lockPostSavingDispatch(`lazyblock-${clientId}`);
    }
  }
  function unlockPostSaving() {
    // We should check this because of Widget screen does not have this feature
    // https://github.com/WordPress/gutenberg/issues/33756
    if (unlockPostSavingDispatch) {
      unlockPostSavingDispatch(`lazyblock-${clientId}`);
    }
  }

  /**
   * Lock post saving if some controls are not valid.
   */
  function maybeLockPostSaving() {
    let shouldLock = 0;
    let thereIsRequired = false;

    // Prevent if component already unmounted.
    if (!isMounted.current) {
      return;
    }

    // check all controls
    Object.keys(lazyBlockData.controls).forEach((k) => {
      const control = lazyBlockData.controls[k];

      if (control.required && control.required === 'true') {
        thereIsRequired = true;

        // Child controls.
        if (control.child_of) {
          if (lazyBlockData.controls[control.child_of]) {
            const childs = getControlValue(
              attributes,
              lazyBlockData,
              lazyBlockData.controls[control.child_of]
            );

            if (childs && childs.length) {
              childs.forEach((childData, childIndex) => {
                const val = getControlValue(attributes, lazyBlockData, control, childIndex);

                if (!isControlValueValid(val, control)) {
                  shouldLock += 1;
                }
              });
            }
          }

          // Single controls.
        } else {
          const val = getControlValue(attributes, lazyBlockData, control);

          if (!isControlValueValid(val, control)) {
            shouldLock += 1;
          }
        }
      }
    });

    // no required controls available.
    if (!thereIsRequired) {
      return;
    }

    // lock or unlock post saving depending on required controls values.
    if (shouldLock > 0) {
      lockPostSaving();
    } else {
      unlockPostSaving();
    }
  }

  const maybeLockPostSavingThrottle = useThrottle(maybeLockPostSaving, 500);

  useEffect(() => {
    // Run throttle when attributes changed.
    if (!isFirstLoad.current) {
      maybeLockPostSavingThrottle();
    }
  }, [attributes]);

  useEffect(() => {
    isFirstLoad.current = false;

    // Try to lock post once component mounted.
    maybeLockPostSaving();

    // Unlock once component unmounted (mostly when block removed).
    return () => {
      isMounted.current = false;

      unlockPostSaving();
    };
  }, []);

  const { blockUniqueClass = '' } = attributes;

  const className = classnames('lazyblock', blockUniqueClass);

  const attsForRender = {};

  // prepare data for preview.
  Object.keys(lazyBlockData.controls).forEach((k) => {
    if (!lazyBlockData.controls[k].child_of) {
      attsForRender[lazyBlockData.controls[k].name] = getControlValue(
        attributes,
        lazyBlockData,
        lazyBlockData.controls[k]
      );
    }
  });

  // reserved attributes.
  const reservedAttributes = [
    'lazyblock',
    'className',
    'align',
    'anchor',
    'blockId',
    'blockUniqueClass',
  ];
  reservedAttributes.forEach((attr) => {
    attsForRender[attr] = attributes[attr];
  });

  // show code preview
  let showPreview = true;

  switch (lazyBlockData.code.show_preview) {
    case 'selected':
      showPreview = isLazyBlockSelected;
      break;
    case 'unselected':
      showPreview = !isLazyBlockSelected;
      break;
    case 'never':
      showPreview = false;
      break;
    // no default
  }

  return (
    <div {...useBlockProps({ className })}>
      <div className="lzb-content-title">
        {lazyBlockData.icon && /^dashicons/.test(lazyBlockData.icon) ? (
          <span className={lazyBlockData.icon} />
        ) : null}
        {lazyBlockData.icon && !/^dashicons/.test(lazyBlockData.icon) ? (
          // eslint-disable-next-line react/no-danger
          <span dangerouslySetInnerHTML={{ __html: lazyBlockData.icon }} />
        ) : null}

        <h6>{lazyBlockData.title}</h6>

        {lazyBlockData.edit_url ? (
          <Tooltip text={__('Edit Block', 'lazy-blocks')}>
            <a
              href={lazyBlockData.edit_url.replace('&amp;', '&')}
              className="lzb-content-edit-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.9287 18C15.2424 18 17.9287 15.3137 17.9287 12C17.9287 8.68629 15.2424 6 11.9287 6C8.61497 6 5.92868 8.68629 5.92868 12C5.92868 15.3137 8.61497 18 11.9287 18ZM11.9287 15C13.5855 15 14.9287 13.6569 14.9287 12C14.9287 10.3431 13.5855 9 11.9287 9C10.2718 9 8.92868 10.3431 8.92868 12C8.92868 13.6569 10.2718 15 11.9287 15Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.2758 4C10.787 4 10.3698 4.35341 10.2894 4.8356L9.92868 7H13.9287L13.5679 4.8356C13.4876 4.35341 13.0704 4 12.5816 4H11.2758ZM12.5816 20C13.0704 20 13.4876 19.6466 13.5679 19.1644L13.9287 17H9.92868L10.2894 19.1644C10.3698 19.6466 10.787 20 11.2758 20H12.5816Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.53 7.43472C18.2856 7.01138 17.7709 6.82678 17.3131 6.99828L15.2583 7.76808L17.2583 11.2322L18.9524 9.83757C19.3298 9.52688 19.4273 8.98888 19.1829 8.56553L18.53 7.43472ZM5.32645 16.5655C5.57087 16.9889 6.08553 17.1735 6.5433 17.002L8.59809 16.2322L6.59809 12.7681L4.90404 14.1627C4.52663 14.4734 4.42916 15.0114 4.67358 15.4347L5.32645 16.5655Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.6745 8.56553C4.43008 8.98888 4.52755 9.52688 4.90495 9.83757L6.59901 11.2322L8.59901 7.76808L6.54422 6.99828C6.08645 6.82678 5.57179 7.01138 5.32737 7.43472L4.6745 8.56553ZM19.1838 15.4347C19.4282 15.0114 19.3307 14.4734 18.9533 14.1627L17.2593 12.7681L15.2593 16.2322L17.3141 17.002C17.7718 17.1735 18.2865 16.9889 18.5309 16.5655L19.1838 15.4347Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </Tooltip>
        ) : null}
      </div>
      <InspectorControls>
        <div className="lzb-inspector-controls">
          <RenderControls
            placement="inspector"
            isLazyBlockSelected={isLazyBlockSelected}
            {...props}
          />
        </div>
      </InspectorControls>
      <div className="lzb-content-controls">
        <RenderControls placement="content" isLazyBlockSelected={isLazyBlockSelected} {...props} />
      </div>
      {showPreview ? (
        <PreviewServerCallback block={lazyBlockData.slug} attributes={attsForRender} />
      ) : null}
    </div>
  );
}
