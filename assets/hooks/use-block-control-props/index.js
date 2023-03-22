import classnames from 'classnames/dedupe';

export default function useBlockControlProps(controlProps, { className, ...data } = {}) {
  const props = {
    label: controlProps.data.label,
    help: controlProps.data.help,
    className: classnames(
      `lazyblocks-control lazyblocks-control-${controlProps.data.type}`,
      className
    ),
    'data-lazyblocks-control-name': controlProps.data.name,
    ...data,
  };

  return props;
}
