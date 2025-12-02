/**
 * Internal dependencies
 */
import getUID from '../../../utils/get-uid';
import getControlTypeData from '../../../utils/get-control-type-data';
import getControlValue from '../../../utils/get-control-value';
import {
	getSlugWithNamespace,
	getSlugWithNamespaceDash,
	getBlockClassName,
	isValidSlug,
} from '../../../utils/block-slug';

export function get() {
	return {
		getUID,
		getControlTypeData,
		getControlValue,
		getSlugWithNamespace,
		getSlugWithNamespaceDash,
		getBlockClassName,
		isValidSlug,
	};
}
