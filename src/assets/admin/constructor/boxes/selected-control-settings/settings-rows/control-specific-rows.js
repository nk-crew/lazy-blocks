const { applyFilters } = wp.hooks;

export default function ControlSpecificRows(props) {
  const result = applyFilters(`lzb.constructor.control.${props.data.type}.settings`, '', props);

  return applyFilters('lzb.constructor.control.settings', result, props);
}
