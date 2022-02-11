/* eslint-disable no-param-reassign */
// External Dependencies.
import classnames from 'classnames/dedupe';
import { throttle } from 'throttle-debounce';

// Internal Dependencies
import '../admin/store';
import './blocks/free';
import './extensions/block-id';

import getControlTypeData from '../admin/utils/get-control-type-data';

import PreviewServerCallback from './blocks/preview-server-callback';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
  options = {
    post_type: 'post',
    blocks: [],
    controls: {},
  };
}

const { cloneDeep } = window.lodash;

const { __ } = wp.i18n;

const { Component, Fragment } = wp.element;

const { applyFilters } = wp.hooks;

const { PanelBody, Notice, Tooltip } = wp.components;

const { InspectorControls, InnerBlocks } = wp.blockEditor;

const { registerBlockType } = wp.blocks;

const { withSelect, withDispatch } = wp.data;

const { compose } = wp.compose;

// each registered block.
options.blocks.forEach((item) => {
  class LazyBlock extends Component {
    constructor(...args) {
      super(...args);

      this.isControlValueValid = this.isControlValueValid.bind(this);
      this.maybeLockPostSaving = throttle(500, this.maybeLockPostSaving.bind(this));
      this.getControlValue = this.getControlValue.bind(this);
      this.onControlChange = this.onControlChange.bind(this);
      this.getControls = this.getControls.bind(this);
      this.renderControls = this.renderControls.bind(this);
    }

    componentDidMount() {
      this.maybeLockPostSaving();
    }

    componentDidUpdate() {
      this.maybeLockPostSaving();
    }

    onControlChange(val, control, childIndex) {
      const { setAttributes } = this.props;

      let { name } = control;

      // prepare child items.
      if (control.child_of && item.controls[control.child_of] && childIndex > -1) {
        const childs = this.getControlValue(item.controls[control.child_of]);

        if (childs && typeof childs[childIndex] !== 'undefined') {
          childs[childIndex][control.name] = val;
          val = childs;
        }

        control = item.controls[control.child_of];
        name = control.name;
      }

      // filter control value.
      val = applyFilters(
        `lzb.editor.control.${control.type}.updateValue`,
        val,
        control,
        childIndex
      );
      val = applyFilters('lzb.editor.control.updateValue', val, control, childIndex);

      const result = {};
      result[name] = val;

      setAttributes(result);
    }

    getControlValue(control, childIndex) {
      const { attributes } = this.props;

      let result = attributes[control.name];

      // prepare child items.
      if (control.child_of && item.controls[control.child_of] && childIndex > -1) {
        const childs = this.getControlValue(item.controls[control.child_of]);

        if (
          childs &&
          typeof childs[childIndex] !== 'undefined' &&
          typeof childs[childIndex][control.name] !== 'undefined'
        ) {
          result = childs[childIndex][control.name];
        }
      }

      // filter control value.
      result = applyFilters(
        `lzb.editor.control.${control.type}.getValue`,
        result,
        control,
        childIndex
      );
      result = applyFilters('lzb.editor.control.getValue', result, control, childIndex);

      return result;
    }

    /**
     * Get controls
     *
     * @param {String|Boolean} childOf - parent control name.
     *
     * @return {Object} controls list.
     */
    // eslint-disable-next-line class-methods-use-this
    getControls(childOf = '') {
      const result = {};

      Object.keys(item.controls).forEach((k) => {
        let control = item.controls[k];
        const controlTypeData = getControlTypeData(control.type);

        if (controlTypeData && controlTypeData.attributes) {
          control = {
            ...cloneDeep(controlTypeData.attributes),
            ...control,
          };
        }

        if ((!childOf && !control.child_of) || (childOf && control.child_of === childOf)) {
          result[k] = control;
        }
      });

      return result;
    }

    maybeLockPostSaving() {
      let shouldLock = 0;
      let thereIsRequired = false;

      // check all controls
      Object.keys(item.controls).forEach((k) => {
        const control = item.controls[k];

        if (control.required && control.required === 'true') {
          thereIsRequired = true;

          // Child controls.
          if (control.child_of) {
            if (item.controls[control.child_of]) {
              const childs = this.getControlValue(item.controls[control.child_of]);

              if (childs && childs.length) {
                childs.forEach((childData, childIndex) => {
                  const val = this.getControlValue(control, childIndex);

                  if (!this.isControlValueValid(val, control)) {
                    shouldLock += 1;
                  }
                });
              }
            }

            // Single controls.
          } else {
            const val = this.getControlValue(control);

            if (!this.isControlValueValid(val, control)) {
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
        this.props.lockPostSaving();
      } else {
        this.props.unlockPostSaving();
      }
    }

    // eslint-disable-next-line class-methods-use-this
    isControlValueValid(val, control) {
      let isValid = val !== '' && typeof val !== 'undefined';

      // custom validation filter.
      isValid = applyFilters(
        `lzb.editor.control.${control.type}.isValueValid`,
        isValid,
        val,
        control
      );
      isValid = applyFilters('lzb.editor.control.isValueValid', isValid, val, control);

      return isValid;
    }

    /**
     * Render controls
     *
     * @param {String} placement - controls placement [inspector, content]
     * @param {String|Boolean} childOf - parent control name.
     * @param {Number|Boolean} childIndex - child index in parent.
     *
     * @return {Array} react blocks with controls.
     */
    renderControls(placement, childOf = '', childIndex = false) {
      let result = [];
      const controls = this.getControls(childOf);

      // prepare attributes.
      Object.keys(controls).forEach((k) => {
        const control = controls[k];

        let placementCheck =
          control.type &&
          control.placement !== 'nowhere' &&
          (control.placement === 'both' || control.placement === placement);
        let { label } = control;

        const controlTypeData = getControlTypeData(control.type);

        // restrictions.
        if (controlTypeData && controlTypeData.restrictions) {
          // Restrict placement.
          if (placementCheck && controlTypeData.restrictions.placement_settings) {
            placementCheck =
              controlTypeData.restrictions.placement_settings.indexOf(placement) > -1;
          }

          // Restrict hide if not selected.
          if (
            placementCheck &&
            placement === 'content' &&
            control.placement === 'content' &&
            controlTypeData.restrictions.hide_if_not_selected_settings &&
            control.hide_if_not_selected &&
            control.hide_if_not_selected === 'true'
          ) {
            placementCheck = this.props.isLazyBlockSelected;
          }

          // Restrict required mark
          if (
            controlTypeData.restrictions.required_settings &&
            control.required &&
            control.required === 'true'
          ) {
            label = (
              <Fragment>
                {label}
                <span className="required">*</span>
              </Fragment>
            );
          }
        }

        // prepare control output
        if (control.child_of || placementCheck) {
          // prepare data for filter.
          const controlData = {
            data: {
              ...control,
              label,
            },
            placement,
            childIndex,
            uniqueId: k,
            getValue: (optionalControl = control, optionalChildIndex = childIndex) =>
              this.getControlValue(optionalControl, optionalChildIndex),
            onChange: (val) => {
              this.onControlChange(val, control, childIndex);
            },
            getControls: this.getControls,
            renderControls: this.renderControls,
          };

          // get control data from filter.
          let controlResult = applyFilters(
            `lzb.editor.control.${control.type}.render`,
            '',
            controlData,
            this.props
          );

          if (controlResult) {
            let controlNotice = '';
            controlResult = applyFilters(
              'lzb.editor.control.render',
              controlResult,
              controlData,
              this.props
            );

            // show error for required fields
            if (
              controlTypeData &&
              controlTypeData.restrictions.required_settings &&
              control.required &&
              control.required === 'true'
            ) {
              const val = this.getControlValue(control, childIndex);

              if (!this.isControlValueValid(val, control)) {
                controlNotice = (
                  <Notice
                    key={`notice-${control.name}`}
                    status="warning"
                    isDismissible={false}
                    className="lzb-constructor-notice"
                  >
                    {__('This field is required', '@@text_domain')}
                  </Notice>
                );
              }
            }

            result.push(
              <div
                key={`control-${k}`}
                style={{
                  width: control.width ? `${control.width}%` : '',
                }}
              >
                {controlResult}
                {controlNotice}
              </div>
            );
          }
        }
      });

      // additional element for better formatting in inspector.
      if (placement === 'inspector' && result.length) {
        result = <PanelBody>{result}</PanelBody>;
      }

      return result;
    }

    render() {
      const { blockUniqueClass = '' } = this.props.attributes;

      const className = classnames(
        'lazyblock',
        `wp-block-${item.slug.replace('/', '-')}`,
        blockUniqueClass
      );

      const attsForRender = {};

      // prepare data for preview.
      Object.keys(item.controls).forEach((k) => {
        if (!item.controls[k].child_of) {
          attsForRender[item.controls[k].name] = this.getControlValue(item.controls[k]);
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
        attsForRender[attr] = this.props.attributes[attr];
      });

      // show code preview
      let showPreview = true;

      switch (item.code.show_preview) {
        case 'selected':
          showPreview = this.props.isLazyBlockSelected;
          break;
        case 'unselected':
          showPreview = !this.props.isLazyBlockSelected;
          break;
        case 'never':
          showPreview = false;
          break;
        // no default
      }

      return (
        <Fragment>
          <InspectorControls>
            <div className="lzb-inspector-controls">{this.renderControls('inspector')}</div>
          </InspectorControls>
          <div className={className}>
            <div className="lzb-content-title">
              {item.icon && /^dashicons/.test(item.icon) ? <span className={item.icon} /> : ''}
              {item.icon && !/^dashicons/.test(item.icon) ? (
                // eslint-disable-next-line react/no-danger
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              ) : (
                ''
              )}

              <h6>{item.title}</h6>

              {item.edit_url ? (
                <Tooltip text={__('Edit Block', '@@text_domain')}>
                  <a
                    href={item.edit_url.replace('&amp;', '&')}
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
              ) : (
                ''
              )}
            </div>
            <div className="lzb-content-controls">{this.renderControls('content')}</div>
            {showPreview ? (
              <PreviewServerCallback block={item.slug} attributes={attsForRender} />
            ) : (
              ''
            )}
          </div>
        </Fragment>
      );
    }
  }

  const LazyBlockWithSelect = compose([
    withSelect((select, ownProps) => {
      const { hasSelectedInnerBlock } = select('core/block-editor');

      return {
        isLazyBlockSelected: ownProps.isSelected || hasSelectedInnerBlock(ownProps.clientId),
      };
    }),
    withDispatch((dispatch, ownProps) => {
      const { lockPostSaving, unlockPostSaving } = dispatch('core/editor') || {};

      return {
        lockPostSaving() {
          // We should check this because of Widget screen does not have this feature
          // https://github.com/WordPress/gutenberg/issues/33756
          if (lockPostSaving) {
            lockPostSaving(`lazyblock-${ownProps.clientId}`);
          }
        },
        unlockPostSaving() {
          // We should check this because of Widget screen does not have this feature
          // https://github.com/WordPress/gutenberg/issues/33756
          if (unlockPostSaving) {
            unlockPostSaving(`lazyblock-${ownProps.clientId}`);
          }
        },
      };
    }),
  ])(LazyBlock);

  // conditionally show for specific post type.
  if (item.supports.inserter && item.condition.length) {
    let preventInsertion = true;
    item.condition.forEach((val) => {
      if (val === options.post_type) {
        preventInsertion = false;
      }
    });
    item.supports.inserter = !preventInsertion;
  }

  let registerIcon = '';

  if (item.icon && /^dashicons/.test(item.icon)) {
    registerIcon = item.icon.replace(/^dashicons dashicons-/, '') || 'marker';
  } else if (item.icon) {
    // eslint-disable-next-line react/no-danger
    registerIcon = <span dangerouslySetInnerHTML={{ __html: item.icon }} />;
  }

  // register block.
  registerBlockType(item.slug, {
    title: item.title || item.slug,
    description: item.description,
    icon: registerIcon,
    category: item.category,
    keywords: item.keywords,
    supports: item.supports,

    ghostkit: item.ghostkit,

    lazyblock: true,

    edit: LazyBlockWithSelect,

    save() {
      let result = null;

      // Return inner blocks content to use it in PHP render.
      Object.keys(item.controls).forEach((k) => {
        if (item.controls[k].type === 'inner_blocks') {
          result = <InnerBlocks.Content />;
        }
      });

      return result;
    },
  });
});
