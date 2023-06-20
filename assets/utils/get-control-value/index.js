/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';

export default function getControlValue(
	attributes,
	meta = {},
	lazyBlockData,
	control,
	childIndex
) {
	let result = attributes[control.name];

	// Prepare Meta control value.
	if (control.save_in_meta === 'true') {
		result = meta[control.save_in_meta_name || control.name];
	}

	// Prepare child items.
	if (
		control.child_of &&
		lazyBlockData.controls[control.child_of] &&
		childIndex > -1
	) {
		const childs = getControlValue(
			attributes,
			meta,
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
	result = applyFilters(
		`lzb.editor.control.${control.type}.getValue`,
		result,
		control,
		childIndex
	);
	result = applyFilters(
		'lzb.editor.control.getValue',
		result,
		control,
		childIndex
	);

	// Prevent rendering an undefined value, because it triggers a JS error
	// when change of new controls inside existing repeater.
	if (typeof result === 'undefined') {
		result = '';
	}

	return result;
}
