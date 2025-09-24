/**
 * Helper utilities for E2E tests.
 *
 * This file contains utility functions that follow Gutenberg patterns
 * for common test operations like URL handling, keyboard shortcuts,
 * and navigation helpers.
 */

import { WP_BASE_URL, TIMEOUTS } from './config.js';

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

/**
 * Waits for navigation to complete with proper timeout.
 *
 * @param {Object} page      - Playwright page object
 * @param {string} waitUntil - Wait until option ('networkidle', 'domcontentloaded', 'load')
 * @param {number} timeout   - Timeout in milliseconds
 * @return {Promise} Navigation promise
 */
export async function waitForNavigation(
	page,
	waitUntil = 'networkidle',
	timeout = TIMEOUTS.LONG
) {
	return page.waitForNavigation({
		waitUntil,
		timeout,
	});
}

/**
 * Clears an input field by selecting all text and typing new value.
 * This is more reliable than using .fill() when the field might have existing content.
 *
 * @param {Object} page     - Playwright page object
 * @param {string} selector - CSS selector for the input field
 * @param {string} value    - Value to type
 */
export async function clearAndType(page, selector, value) {
	await page.focus(selector);
	await pressKeyWithModifier(page, 'primary', 'a'); // Select all
	await page.type(selector, value);
}

/**
 * Waits for a selector to be present and optionally visible.
 *
 * @param {Object}  page            - Playwright page object
 * @param {string}  selector        - CSS selector to wait for
 * @param {Object}  options         - Options object
 * @param {boolean} options.visible - Wait for element to be visible
 * @param {number}  options.timeout - Timeout in milliseconds
 * @return {Promise} Element handle promise
 */
export async function waitForSelector(page, selector, options = {}) {
	const { visible = true, timeout = TIMEOUTS.MEDIUM } = options;

	return page.waitForSelector(selector, {
		visible,
		timeout,
	});
}

/**
 * Gets the current page title.
 *
 * @param {Object} page - Playwright page object
 * @return {Promise<string>} Page title
 */
export async function getPageTitle(page) {
	return page.title();
}

/**
 * Waits for page to load completely.
 *
 * @param {Object} page    - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForPageLoad(page, timeout = TIMEOUTS.LONG) {
	await page.waitForLoadState('networkidle', { timeout });
}
