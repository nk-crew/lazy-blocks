const { applyFilters } = wp.hooks;

export default function isControlValueValid(val, control) {
  let isValid = val !== '' && typeof val !== 'undefined';

  // custom validation filter.
  isValid = applyFilters(`lzb.editor.control.${control.type}.isValueValid`, isValid, val, control);
  isValid = applyFilters('lzb.editor.control.isValueValid', isValid, val, control);

  return isValid;
}
