const { applyFilters } = wp.hooks;

export default function getControlValue(attributes, lazyBlockData, control, childIndex) {
  let result = attributes[control.name];

  // Prepare child items.
  if (control.child_of && lazyBlockData.controls[control.child_of] && childIndex > -1) {
    const childs = getControlValue(
      attributes,
      lazyBlockData,
      lazyBlockData.controls[control.child_of]
    );

    if (
      childs &&
      typeof childs[childIndex] !== 'undefined' &&
      typeof childs[childIndex][control.name] !== 'undefined'
    ) {
      result = childs[childIndex][control.name];
    }
  }

  // Filter control value.
  result = applyFilters(`lzb.editor.control.${control.type}.getValue`, result, control, childIndex);
  result = applyFilters('lzb.editor.control.getValue', result, control, childIndex);

  // Prevent rendering an undefined value, because it triggers a JS error
  // when change of new controls inside existing repeater.
  if (typeof result === 'undefined') {
    result = '';
  }

  return result;
}
