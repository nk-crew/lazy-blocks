/**
 * Helper utilities for E2E tests.
 *
 * This file contains utility functions that follow Gutenberg patterns
 * for common test operations like URL handling, keyboard shortcuts,
 * and navigation helpers.
 */

import { WP_BASE_URL } from './config.js';

/**
 * Creates a WordPress URL by joining the base URL with the provided path.
 *
 * @param {string} wpPath - WordPress path (e.g., 'wp-admin', 'wp-login.php')
 * @param {string} query  - Optional query string
 * @return {string} Complete URL
 */
export function createURL(wpPath = '', query = '') {
	const url = new URL(WP_BASE_URL);

	// Ensure wpPath starts with a slash for proper joining
	const normalizedPath = wpPath.startsWith('/') ? wpPath : `/${wpPath}`;
	url.pathname = new URL(normalizedPath, url).pathname;

	if (query) {
		url.search = query;
	}

	return url.href;
}

/**
 * Checks if the current page URL matches the expected path.
 *
 * @param {Object} page         - Playwright page object
 * @param {string} expectedPath - Expected path to match
 * @return {Promise<boolean>} True if current URL matches expected path
 */
export async function isCurrentURL(page, expectedPath) {
	const currentUrl = page.url();
	const expectedUrl = createURL(expectedPath);

	// Compare pathname and search params, ignore hash
	const currentUrlObj = new URL(currentUrl);
	const expectedUrlObj = new URL(expectedUrl);

	return (
		currentUrlObj.pathname === expectedUrlObj.pathname &&
		currentUrlObj.search === expectedUrlObj.search
	);
}

/**
 * Presses a key combination with modifier.
 * Based on Gutenberg's pressKeyWithModifier function.
 *
 * @param {Object} page     - Playwright page object
 * @param {string} modifier - Modifier key ('primary', 'ctrl', 'meta', 'alt', 'shift')
 * @param {string} key      - Key to press
 */
export async function pressKeyWithModifier(page, modifier, key) {
	let modifierKey;

	switch (modifier) {
		case 'primary':
			// Use Ctrl on Windows/Linux, Cmd on Mac
			modifierKey = process.platform === 'darwin' ? 'Meta' : 'Control';
			break;
		case 'ctrl':
			modifierKey = 'Control';
			break;
		case 'meta':
			modifierKey = 'Meta';
			break;
		case 'alt':
			modifierKey = 'Alt';
			break;
		case 'shift':
			modifierKey = 'Shift';
			break;
		default:
			throw new Error(`Unknown modifier: ${modifier}`);
	}

	await page.keyboard.press(`${modifierKey}+${key}`);
}
