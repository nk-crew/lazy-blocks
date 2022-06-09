/**
 * WordPress dependencies
 */
const $ = window.jQuery;

const { select, dispatch } = wp.data;

// de-select active control when click outside.
$(document).on('click', (e) => {
  const $this = $(e.target);
  const selectedControlId = select('lazy-blocks/block-data').getSelectedControlId();
  const { clearSelectedControl } = dispatch('lazy-blocks/block-data');

  if (!selectedControlId) {
    return;
  }

  // click outside of content.
  if (!$this.closest('.edit-post-layout__content').length) {
    return;
  }

  // click on notice.
  if ($this.closest('.components-notice-list').length) {
    return;
  }

  // click on control.
  if ($this.closest('.lzb-constructor-controls-item').length) {
    return;
  }

  // click on code box.
  if ($this.closest('.lazyblocks-component-box').length) {
    return;
  }

  // click on add control button.
  if ($this.hasClass('lzb-constructor-controls-item-appender')) {
    return;
  }

  // clear selected control.
  clearSelectedControl();
});
