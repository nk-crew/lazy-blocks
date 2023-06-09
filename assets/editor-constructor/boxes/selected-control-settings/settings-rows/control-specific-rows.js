/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';

export default function ControlSpecificRows(props) {
	const result = applyFilters(
		`lzb.constructor.control.${props.data.type}.settings`,
		'',
		props
	);

	return applyFilters('lzb.constructor.control.settings', result, props);
}
