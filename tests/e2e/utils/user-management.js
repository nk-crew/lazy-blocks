/**
 * User management utilities for E2E tests.
 *
 * These utilities provide functions to create, login, and manage test users
 * for testing different permission levels and security scenarios.
 * Based on Gutenberg test utilities patterns.
 */

import {
	COOKIE_PATTERNS,
	SELECTORS,
	TEST_USER_DEFAULTS,
	TIMEOUTS,
	WP_ADMIN_USER,
} from './config.js';
import { createURL, isCurrentURL } from './helpers.js';

/**
 * Creates a test user with the specified role.
 *
 * @param {Object} requestUtils - WordPress REST API request utilities
 * @param {string} username     - Username for the new user
 * @param {string} email        - Email for the new user
 * @param {string} password     - Password for the new user
 * @param {string} role         - WordPress role (contributor, author, editor, administrator)
 * @return {Promise<Object>} User object with id, username, email, role
 */
async function createTestUser(requestUtils, username, email, password, role) {
	try {
		const user = await requestUtils.rest({
			method: 'POST',
			path: '/wp/v2/users',
			data: {
				username,
				email,
				password,
				roles: [role],
			},
		});

		return {
			id: user.id,
			username: user.username,
			email: user.email,
			role,
			password, // Store for login purposes
		};
	} catch (error) {
		// If user already exists, try to get the existing user
		if (error.message && error.message.includes('already exists')) {
			const users = await requestUtils.rest({
				path: '/wp/v2/users',
				params: {
					search: username,
				},
			});

			const existingUser = users.find((u) => u.username === username);
			if (existingUser) {
				return {
					id: existingUser.id,
					username: existingUser.username,
					email: existingUser.email,
					role,
					password,
				};
			}
		}
		throw error;
	}
}

/**
 * Logs in as the specified user.
 * Based on Gutenberg's loginUser function with improvements.
 *
 * @param {Object} page     - Playwright page object
 * @param {string} username - Username to login as (defaults to admin)
 * @param {string} password - Password for the user (defaults to admin password)
 */
export async function loginUser(
	page,
	username = WP_ADMIN_USER.username,
	password = WP_ADMIN_USER.password
) {
	// Fast failure if page is closed or invalid
	try {
		if (page.isClosed()) {
			throw new Error('Page is closed, cannot perform login');
		}
	} catch (_error) {
		throw new Error('Page context is invalid, cannot perform login');
	}

	// Navigate to login page if not already there. `goto` resolves on the
	// navigation it started, so there is nothing extra to wait for.
	if (!(await isCurrentURL(page, 'wp-login.php'))) {
		await page.goto(createURL('wp-login.php'));
	}

	// `fill` clears the field before typing, which is what the select-all
	// dance around `type` was for.
	await page.fill(SELECTORS.LOGIN_USERNAME, username);
	await page.fill(SELECTORS.LOGIN_PASSWORD, password);

	await page.click(SELECTORS.LOGIN_SUBMIT);

	// Not `waitForNavigation`: it has to be listening before the navigation it
	// waits for begins, and the click above may well have finished first — in
	// which case it waits for the *next* navigation, which never comes.
	// `waitForURL` looks at where the page already is, so it cannot miss.
	// A failed login stays on wp-login.php and fails here, as it should.
	await page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), {
		timeout: TIMEOUTS.LONG,
	});
}

/**
 * Logs out the current user.
 * Based on Gutenberg's logout function using admin bar hover method.
 *
 * @param {Object} page - Playwright page object
 */
export async function logoutUser(page) {
	// If not on login or admin page, navigate to wp-admin
	if (
		!(await isCurrentURL(page, 'wp-login.php')) &&
		!(await isCurrentURL(page, 'wp-admin'))
	) {
		await page.goto(createURL('wp-admin'));
	}

	try {
		// Try to use admin bar logout (more reliable)
		await Promise.all([
			page.hover(SELECTORS.ADMIN_BAR_USER_MENU),
			page.waitForSelector(SELECTORS.ADMIN_BAR_LOGOUT, {
				state: 'visible',
				timeout: TIMEOUTS.SHORT,
			}),
		]);

		await page.click(SELECTORS.ADMIN_BAR_LOGOUT);
	} catch {
		// Fallback: direct logout URL method
		await page.goto(createURL('wp-login.php', 'action=logout'));

		// Handle the logout confirmation if present
		try {
			const logoutLink = page.getByRole('link', { name: 'log out' });
			await logoutLink.click({ timeout: TIMEOUTS.SHORT });
		} catch {
			// Logout link may not be present if already logged out
		}
	}

	// Wait for login page to confirm logout
	await page.waitForSelector(SELECTORS.LOGIN_FORM, {
		state: 'visible',
		timeout: TIMEOUTS.MEDIUM,
	});
}

/**
 * Deletes a test user.
 *
 * @param {Object}  requestUtils - WordPress REST API request utilities
 * @param {number}  userId       - ID of the user to delete
 * @param {boolean} reassign     - Whether to reassign posts to another user (default: true, reassigns to user 1)
 */
export async function deleteTestUser(requestUtils, userId, reassign = true) {
	try {
		await requestUtils.rest({
			method: 'DELETE',
			path: `/wp/v2/users/${userId}`,
			params: {
				force: true,
				reassign: reassign ? 1 : undefined, // Reassign to admin user (ID 1)
			},
		});
	} catch (_error) {
		// User might already be deleted or not exist
		// Silently ignore deletion errors in tests
	}
}

/**
 * Gets the current logged-in user info.
 * Based on Gutenberg's getCurrentUser function using cookie detection.
 *
 * @param {Object} page - Playwright page object
 * @return {Promise<string|null>} Current username or null if not logged in
 */
export async function getCurrentUser(page) {
	try {
		// `page.cookies()` is Puppeteer's; in Playwright cookies belong to the
		// context. The old call threw, the catch below swallowed it, and this
		// function always answered "nobody is logged in" — so both callers
		// below logged in again every single time.
		const cookies = await page.context().cookies();
		const loginCookie = cookies.find((cookie) =>
			cookie.name?.startsWith(COOKIE_PATTERNS.LOGGED_IN)
		);

		if (!loginCookie?.value) {
			return null;
		}

		// Decode cookie value and extract username
		const decodedValue = decodeURIComponent(loginCookie.value);
		return decodedValue.split('|')[0] || null;
	} catch {
		return null;
	}
}

/**
 * Switches to admin user if not already logged in as admin.
 * Based on Gutenberg's switchUserToAdmin function.
 *
 * @param {Object} page - Playwright page object
 */
export async function switchUserToAdmin(page) {
	// Fast failure if page is closed or invalid
	try {
		if (page.isClosed()) {
			return; // Skip if page is already closed
		}
	} catch (_error) {
		return; // Skip if page context is invalid
	}

	const currentUser = await getCurrentUser(page);
	if (currentUser === WP_ADMIN_USER.username) {
		return;
	}
	await loginUser(page, WP_ADMIN_USER.username, WP_ADMIN_USER.password);
}

/**
 * Switches to a specific contributor user.
 * Optimized for test performance.
 *
 * @param {Object} page     - Playwright page object
 * @param {string} username - Contributor username
 * @param {string} password - Contributor password
 */
export async function switchUserToContributor(page, username, password) {
	const currentUser = await getCurrentUser(page);
	if (currentUser === username) {
		return;
	}
	await loginUser(page, username, password);
}

/**
 * Creates a test user with enhanced configuration support.
 * Uses role-based defaults from config.
 *
 * @param {Object} requestUtils - WordPress REST API request utilities
 * @param {string} username     - Username for the new user
 * @param {string} role         - WordPress role (contributor, author, editor, administrator)
 * @param {Object} overrides    - Optional overrides for user data
 * @return {Promise<Object>} User object with id, username, email, role
 */
export async function createTestUserWithDefaults(
	requestUtils,
	username,
	role,
	overrides = {}
) {
	const roleDefaults = TEST_USER_DEFAULTS[role];
	if (!roleDefaults) {
		throw new Error(
			`Unknown role: ${role}. Available roles: ${Object.keys(TEST_USER_DEFAULTS).join(', ')}`
		);
	}

	// Generate unique email to avoid conflicts
	const uniqueId = Date.now();
	const baseEmail = roleDefaults.email.split('@');
	const uniqueEmail = `${baseEmail[0]}_${uniqueId}@${baseEmail[1]}`;

	const userData = {
		email: uniqueEmail,
		password: 'testpass123',
		...overrides,
	};

	return createTestUser(
		requestUtils,
		username,
		userData.email,
		userData.password,
		role
	);
}
