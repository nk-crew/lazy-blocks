/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';

export default function isValidBlockHTML(html) {
	const parser = new window.DOMParser();
	const doc = parser.parseFromString(html, 'text/xml');
	const parseError = doc.documentElement.querySelector('parsererror');
	let isValid;

	isValid = parseError ? parseError.innerText : true;

	// custom validation filter.
	isValid = applyFilters('lzb.editor.block.isValidBlockHTML', isValid, html);

	return isValid;
}
