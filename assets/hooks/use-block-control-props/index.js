import classnames from 'classnames/dedupe';

import getControlTypeData from '../../utils/get-control-type-data';

export default function useBlockControlProps(
	controlProps,
	{ className, ...data } = {}
) {
	const controlTypeData = getControlTypeData(controlProps.data.type);
	const props = {
		label: controlTypeData.restrictions.label_settings
			? controlProps.data.label
			: false,
		help: controlTypeData.restrictions.help_settings
			? controlProps.data.help
			: false,
		className: classnames(
			`lazyblocks-control lazyblocks-control-${controlProps.data.type}`,
			className
		),
		'data-lazyblocks-control-name': controlProps.data.name,
		...data,
	};

	return props;
}
