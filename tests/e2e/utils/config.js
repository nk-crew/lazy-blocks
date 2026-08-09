/**
 * Shared configuration for E2E tests.
 *
 * This configuration follows Gutenberg patterns for managing test environment
 * settings, credentials, and constants.
 */

import { getPorts } from '@nk-crew/plugin-toolkit/env-ports';

/**
 * Base URL for the WordPress test site.
 *
 * The port is never hardcoded: every checkout derives its own pair, so a
 * literal one sends the specs at whichever branch happens to own 8889.
 * `WP_BASE_URL` is exported by the Playwright config, and
 * `PLAYWRIGHT_TEST_BASE_URL` by Playwright itself once the web server is up.
 */
export const WP_BASE_URL =
	process.env.WP_BASE_URL ||
	process.env.PLAYWRIGHT_TEST_BASE_URL ||
	`http://localhost:${getPorts().testsPort}`;

/**
 * Default admin user configuration object.
 * Can be overridden via WP_USERNAME and WP_PASSWORD environment variables.
 */
export const WP_ADMIN_USER = {
	username: process.env.WP_USERNAME || 'admin',
	password: process.env.WP_PASSWORD || 'password',
};

/**
 * Test timeout constants (in milliseconds).
 */
export const TIMEOUTS = {
	SHORT: 3000,
	MEDIUM: 5000,
	LONG: 10000,
};

/**
 * Common WordPress selectors used in tests.
 */
export const SELECTORS = {
	LOGIN_FORM: '#loginform',
	LOGIN_USERNAME: '#user_login',
	LOGIN_PASSWORD: '#user_pass',
	LOGIN_SUBMIT: '#wp-submit',
	ADMIN_BAR: '#wpadminbar',
	ADMIN_BAR_USER_MENU: '#wp-admin-bar-my-account',
	ADMIN_BAR_LOGOUT: '#wp-admin-bar-logout',
	ADMIN_BODY: 'body.wp-admin',
};

/**
 * WordPress cookie patterns.
 */
export const COOKIE_PATTERNS = {
	LOGGED_IN: 'wordpress_logged_in_',
};

/**
 * Test user defaults for different roles.
 */
export const TEST_USER_DEFAULTS = {
	contributor: {
		role: 'contributor',
		email: 'contributor@example.com',
		capabilities: ['read', 'read_lazyblock'],
	},
	author: {
		role: 'author',
		email: 'author@example.com',
		capabilities: ['read', 'read_lazyblock', 'edit_posts', 'delete_posts'],
	},
	editor: {
		role: 'editor',
		email: 'editor@example.com',
		capabilities: [
			'read',
			'read_lazyblock',
			'edit_posts',
			'edit_others_posts',
		],
	},
	administrator: {
		role: 'administrator',
		email: 'admin@example.com',
		capabilities: ['read', 'read_lazyblock', 'edit_lazyblocks'],
	},
};
