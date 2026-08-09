/**
 * Internal dependencies
 */

import {
	getBlockClassName,
	getSlugWithNamespace,
	getSlugWithNamespaceDash,
	isValidSlug,
} from '../../../utils/block-slug';
import getControlTypeData from '../../../utils/get-control-type-data';
import getControlValue from '../../../utils/get-control-value';
import getUID from '../../../utils/get-uid';

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
