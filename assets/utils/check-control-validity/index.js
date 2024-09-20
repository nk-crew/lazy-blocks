/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import getControlTypeData from '../get-control-type-data';

export default function checkControlValidity(val, control) {
	let result = false;

	const controlTypeData = getControlTypeData(control.type);

	if (
		controlTypeData &&
		controlTypeData.restrictions.required_settings &&
		control.required &&
		control.required === 'true'
	) {
		const isValid = val !== '' && typeof val !== 'undefined';

		// custom validation filter.
		const { valid, message } = applyFilters(
			'lzb.editor.control.validate',
			applyFilters(
				`lzb.editor.control.${control.type}.validate`,
				{ valid: isValid, message: '' },
				val,
				control
			),
			val,
			control
		);

		if (!valid) {
			result = message || __('This control is required.', 'lazy-blocks');
		}
	}

	return result;
}
