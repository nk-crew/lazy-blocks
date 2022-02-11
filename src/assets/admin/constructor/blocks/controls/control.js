/* eslint-disable camelcase */
import classnames from 'classnames/dedupe';
import * as clipboard from 'clipboard-polyfill';

import Copied from '../../../components/copied';
import getControlTypeData from '../../../utils/get-control-type-data';

const { merge } = window.lodash;

const { __ } = wp.i18n;
const { Component } = wp.element;

const { compose } = wp.compose;

const { applyFilters } = wp.hooks;

const { withDispatch, withSelect } = wp.data;

class Control extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      collapsedChilds: false,
      copied: false,
    };

    this.toggleCollapseChilds = this.toggleCollapseChilds.bind(this);
    this.copyName = this.copyName.bind(this);
  }

  toggleCollapseChilds() {
    this.setState((prevState) => ({ collapsedChilds: !prevState.collapsedChilds }));
  }

  copyName(name) {
    clipboard.writeText(name);

    this.setState({
      copied: true,
    });

    clearTimeout(this.copiedTimeout);

    this.copiedTimeout = setTimeout(() => {
      this.setState({
        copied: false,
      });
    }, 350);
  }

  render() {
    const { selectControl, data, id, DragHandle, isSelected, addControl, removeControl, controls } =
      this.props;

    const { label, name, placeholder, save_in_meta, save_in_meta_name, type, required } = data;

    const controlTypeData = getControlTypeData(type);

    let controlName = name;
    if (save_in_meta === 'true') {
      controlName = save_in_meta_name || name;
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

    // Item with filter
    let controlsItem = applyFilters(
      `lzb.constructor.controls.${type}.item`,
      <div
        className="lzb-constructor-controls-item"
        onClick={() => {
          selectControl(id);
        }}
        role="none"
      >
        <div className="lzb-constructor-controls-item-icon">
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: controlTypeData.icon }} />
          <DragHandle />
        </div>
        <div className="lzb-constructor-controls-item-label">
          <span className="lzb-constructor-controls-item-label-text">
            {label || placeholder || (
              <span className="lzb-constructor-controls-item-label-no">
                {__('(no label)', '@@text_domain')}
              </span>
            )}
            {required === 'true' ? <span className="required">*</span> : ''}
          </span>
          <span className="lzb-constructor-controls-item-label-buttons">
            {!isUseOnce ? (
              // eslint-disable-next-line react/button-has-type
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const newData = merge({}, data);

                  newData.label += ` ${__('(copy)', '@@text_domain')}`;
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
                {__('Duplicate', '@@text_domain')}
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
                if (window.confirm(__('Do you really want to remove control?', '@@text_domain'))) {
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
              {__('Remove', '@@text_domain')}
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
              this.copyName(controlName);
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
            {this.state.copied ? <Copied /> : ''}
          </button>
        ) : (
          ''
        )}
      </div>,
      this.props
    );

    controlsItem = applyFilters('lzb.constructor.controls.item', controlsItem, this.props);

    return (
      <div
        className={classnames(
          'lzb-constructor-controls-item-wrap',
          isSelected ? 'lzb-constructor-controls-item-wrap-selected' : ''
        )}
      >
        {controlsItem}
      </div>
    );
  }
}

export default compose([
  withSelect((select, ownProps) => {
    const { getSelectedControlId } = select('lazy-blocks/block-data');

    return {
      isSelected: ownProps.id === getSelectedControlId(),
    };
  }),
  withDispatch((dispatch) => {
    const { selectControl } = dispatch('lazy-blocks/block-data');

    return {
      selectControl,
    };
  }),
])(Control);
