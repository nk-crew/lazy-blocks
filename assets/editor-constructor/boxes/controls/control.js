/* eslint-disable camelcase */
import classnames from 'classnames/dedupe';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import Copied from '../../../components/copied';
import getControlTypeData from '../../../utils/get-control-type-data';

const { merge } = window.lodash;

const { __ } = wp.i18n;
const { useState } = wp.element;

const { applyFilters } = wp.hooks;

const { useDispatch, useSelect } = wp.data;

let copiedTimeout;

export default function Control(props) {
  const { data, id, addControl, removeControl, controls } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } =
    useSortable({
      id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isSorting ? transition : '',
  };

  const [copied, setCopied] = useState(false);

  const { isSelected } = useSelect(
    (select) => {
      const { getSelectedControlId } = select('lazy-blocks/block-data');

      return {
        isSelected: id === getSelectedControlId(),
      };
    },
    [id]
  );

  const { selectControl } = useDispatch('lazy-blocks/block-data');

  function copyName(name) {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(true);

      clearTimeout(copiedTimeout);

      copiedTimeout = setTimeout(() => {
        setCopied(false);
      }, 350);
    });
  }

  const { label, name, placeholder, save_in_meta, save_in_meta_name, type, required } = data;

  const controlTypeData = getControlTypeData(type);

  let controlName = name;
  if (save_in_meta === 'true') {
    controlName = save_in_meta_name || name;
  }

  if (!controlTypeData.restrictions.name_settings) {
    controlName = '';
  }

  let isUseOnce = false;

  // restrict once per block.
  if (!isUseOnce && controlTypeData && controlTypeData.restrictions.once && controls) {
    Object.keys(controls).forEach((i) => {
      if (controlTypeData.name === controls[i].type) {
        isUseOnce = true;
      }
    });
  }

  let controlsItemAttributes = {
    className: classnames(
      'lzb-constructor-controls-item',
      controlTypeData.name === 'undefined' ? 'lzb-constructor-controls-item-undefined' : '',
      isSelected ? 'lzb-constructor-controls-item-selected' : '',
      isDragging ? 'lzb-constructor-controls-item-dragging' : ''
    ),
    onClick: () => {
      selectControl(id);
    },
    role: 'none',
    'data-control-type': data.type,
    'data-control-name': data.name,
    'data-control-label': data.type,
    ref: setNodeRef,
    style,
  };
  controlsItemAttributes = applyFilters(
    `lzb.constructor.controls.${type}.item-attributes`,
    controlsItemAttributes,
    props
  );
  controlsItemAttributes = applyFilters(
    'lzb.constructor.controls.item-attributes',
    controlsItemAttributes,
    props
  );

  // Item with filter
  let controlsItem = (
    <div {...controlsItemAttributes}>
      <div className="lzb-constructor-controls-item-icon">
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: controlTypeData.icon }} />
        <span className="lzb-constructor-controls-item-handler" {...attributes} {...listeners}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 4.99976H8V6.99976H10V4.99976Z" fill="currentColor" />
            <path d="M10 10.9998H8V12.9998H10V10.9998Z" fill="currentColor" />
            <path d="M10 16.9998H8V18.9998H10V16.9998Z" fill="currentColor" />
            <path d="M16 4.99976H14V6.99976H16V4.99976Z" fill="currentColor" />
            <path d="M16 10.9998H14V12.9998H16V10.9998Z" fill="currentColor" />
            <path d="M16 16.9998H14V18.9998H16V16.9998Z" fill="currentColor" />
          </svg>
        </span>
      </div>
      <div className="lzb-constructor-controls-item-label">
        {controlTypeData.restrictions.label_settings ? (
          <span className="lzb-constructor-controls-item-label-text">
            {label || placeholder || (
              <span className="lzb-constructor-controls-item-label-no">
                {__('(no label)', 'lazy-blocks')}
              </span>
            )}
            {required === 'true' ? <span className="required">*</span> : ''}
          </span>
        ) : (
          <span className="lzb-constructor-controls-item-label-text">&nbsp;</span>
        )}
        <span className="lzb-constructor-controls-item-label-buttons">
          {!isUseOnce ? (
            // eslint-disable-next-line react/button-has-type
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const newData = merge({}, data);

                newData.label += ` ${__('(copy)', 'lazy-blocks')}`;
                newData.name += '-copy';

                addControl(newData, id);
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V13C19.25 13.6904 18.6904 14.25 18 14.25H11C10.3096 14.25 9.75 13.6904 9.75 13V6C9.75 5.30964 10.3096 4.75 11 4.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 10.5H6C5.72386 10.5 5.5 10.7239 5.5 11V18C5.5 18.2761 5.72386 18.5 6 18.5H13C13.2761 18.5 13.5 18.2761 13.5 18V17H15V18C15 19.1046 14.1046 20 13 20H6C4.89543 20 4 19.1046 4 18V11C4 9.89543 4.89543 9 6 9H7V10.5Z"
                  fill="currentColor"
                />
              </svg>
              {__('Duplicate', 'lazy-blocks')}
            </button>
          ) : (
            ''
          )}
          {/* eslint-disable-next-line react/button-has-type */}
          <button
            className="lzb-constructor-controls-item-label-buttons-remove"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // eslint-disable-next-line
              if (window.confirm(__('Do you really want to remove control?', 'lazy-blocks'))) {
                removeControl();
              }
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.33734 7.1706C6.23299 6.4793 6.76826 5.85717 7.4674 5.85717H16.5326C17.2317 5.85717 17.767 6.4793 17.6627 7.17061L15.9807 18.3134C15.8963 18.8724 15.416 19.2857 14.8507 19.2857H9.14934C8.58403 19.2857 8.10365 18.8724 8.01928 18.3134L6.33734 7.1706Z"
                stroke="currentColor"
                strokeWidth="1.71429"
              />
              <rect x="4" y="5" width="16" height="2" fill="currentColor" />
              <path
                d="M14.2857 5C14.2857 5 13.2624 5 12 5C10.7376 5 9.71428 5 9.71428 5C9.71428 3.73763 10.7376 2.71429 12 2.71429C13.2624 2.71429 14.2857 3.73763 14.2857 5Z"
                fill="currentColor"
              />
            </svg>
            {__('Remove', 'lazy-blocks')}
          </button>
        </span>
      </div>
      {!data.child_of && controlName ? (
        // eslint-disable-next-line react/button-has-type
        <button
          className="lzb-constructor-controls-item-name"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copyName(controlName);
          }}
        >
          {controlName}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
          {copied ? <Copied /> : ''}
        </button>
      ) : (
        ''
      )}
    </div>
  );

  controlsItem = applyFilters(`lzb.constructor.controls.${type}.item`, controlsItem, props);
  controlsItem = applyFilters('lzb.constructor.controls.item', controlsItem, props);

  return controlsItem;
}
