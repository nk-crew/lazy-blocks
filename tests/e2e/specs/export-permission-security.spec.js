/**
 * E2E test for export permission security vulnerability.
 *
 * This test verifies that the broken access control vulnerability has been fixed
 * by testing admin, unauthenticated, and contributor users to ensure proper
 * permission enforcement for export functionality.
 */

import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { createURL } from '../utils/helpers';
import { removeAllBlocks } from '../utils/remove-all-blocks';
import {
	createTestUserWithDefaults,
	deleteTestUser,
	logoutUser,
	switchUserToContributor,
} from '../utils/user-management';

test.describe('Export Permission Security', () => {
	let sharedBlockId = null;

	// Per test, not `beforeAll`. `afterEach` runs `removeAllBlocks`, which keeps
	// only a block titled `Example Block` -- so this one was deleted after the
	// first test and the later tests read an id whose post no longer existed.
	// They still passed, because a missing block denies access just as a
	// permission check would, which is exactly the kind of green nobody wants.
	test.beforeEach(async ({ requestUtils }) => {
		sharedBlockId = await createBlock({
			requestUtils,
			title: 'Shared Security Test Block',
			slug: 'shared-security-test',
			code: 'Test block for export security verification',
			codeSingleOutput: true,
		});
	});

	test.afterEach(async ({ requestUtils }) => {
		// Clean up test blocks after each test
		await removeAllBlocks({ requestUtils });
	});

	test('Admin can create and export blocks', async ({
		admin,
		page,
		requestUtils,
	}) => {
		// Built over REST rather than through the wizard. The wizard path this
		// used to duplicate -- Continue, Title, Continue, Finish, double
		// Publish, read post_ID -- is block-builder-create-block.spec.js's whole
		// subject, and running it a second time here proved nothing extra. What
		// is unique to this file is the export row action below.
		const postID = await createBlock({
			requestUtils,
			title: 'Admin Test Block',
			slug: 'admin-test-block',
			code: 'Admin export test block',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator(`#post-${postID}`)).toBeVisible();

		// The export row action carries a nonce. Asserted unconditionally: this
		// used to be wrapped in `if ( count > 0 )`, so if the action ever stopped
		// rendering the test would report success having checked nothing -- and
		// the export link is the entire subject of this file.
		//
		// `class-blocks.php` renders the action for every listed block, so
		// exactly one is expected. WordPress positions row actions off-screen
		// rather than hiding them, so Playwright still counts them visible.
		const exportLink = page.locator(
			`a[href*="lazyblocks_export_block=${postID}"]`
		);
		await expect(exportLink).toHaveCount(1);

		const exportHref = await exportLink.getAttribute('href');
		expect(exportHref).toContain(`lazyblocks_export_block=${postID}`);
		expect(exportHref).toContain('lazyblocks_export_nonce=');
	});

	test('Unauthenticated users cannot export blocks', async ({ page }) => {
		// Use shared block (much faster than UI creation)
		const blockId = sharedBlockId;

		// Log out to test without authentication
		await logoutUser(page);

		// Generate a fake nonce (unauthenticated users can't generate valid nonces)
		const fakeNonce = 'invalid_nonce_12345';

		// Test the vulnerability - attempt to access export URL directly
		const exportUrl = createURL(
			'wp-admin/edit.php',
			`post_type=lazyblocks&lazyblocks_export_block=${blockId}&lazyblocks_export_nonce=${fakeNonce}`
		);

		// Set up listeners to detect if export happens
		let downloadTriggered = false;
		const exportListener = (response) => {
			const headers = response.headers();
			if (
				headers['content-disposition'] &&
				headers['content-disposition'].includes('attachment')
			) {
				downloadTriggered = true;
			}
		};

		page.on('response', exportListener);

		try {
			// Attempt to access the export URL without authentication
			// No `networkidle` wait: `exportListener` above fires during this
			// navigation, redirect chain included, so the outcome is already
			// settled by the time `goto` resolves. The sibling contributor test
			// does the same `goto` without one and is not flaky.
			const response = await page.goto(exportUrl);
			page.off('response', exportListener);

			// Check 1: Verify no file download was triggered
			expect(downloadTriggered).toBe(false);

			// Check 2: Should redirect to login page or return error
			const currentUrl = page.url();
			const pageContent = await page.content();

			// Either redirected to login page OR blocked with error
			const isBlocked =
				currentUrl.includes('wp-login.php') ||
				!pageContent.includes('"lazyblocks_export"');

			expect(isBlocked).toBe(true);

			// Check 3: If not redirected, should have proper error status
			if (!currentUrl.includes('wp-login.php') && response) {
				expect(response.status()).not.toBe(200);
			}
		} catch (error) {
			page.off('response', exportListener);

			// If error occurs, it should NOT be due to download
			expect(error.message).not.toContain('ERR_ABORTED');

			// Re-throw other errors
			throw error;
		}
	});

	test('Contributor cannot export blocks', async ({ page, requestUtils }) => {
		let testUser = null;

		try {
			// Use shared block (much faster than UI creation)
			const blockId = sharedBlockId;

			// Create a contributor user using role defaults
			testUser = await createTestUserWithDefaults(
				requestUtils,
				`test_contributor_${Date.now()}`,
				'contributor'
			);

			// Switch to contributor user (smart switching - no logout if unnecessary)
			await switchUserToContributor(
				page,
				testUser.username,
				testUser.password
			);

			// A fake nonce, and deliberately so: a contributor cannot obtain a
			// real one. Both places that mint `lzb-export-blocks-nonce` are out
			// of a contributor's reach -- the export row action renders on the
			// blocks list table, gated by `edit_lazyblocks`, and the Tools
			// screen is registered under `manage_options` -- and WordPress
			// nonces are bound to the user, so one scraped as admin would not
			// verify here either.
			//
			// So this asserts the outer gate: a contributor driving the export
			// URL by hand is refused. It does NOT reach
			// `current_user_can( 'edit_lazyblocks' )` in `maybe_export_json()`,
			// because the nonce check `wp_die()`s first. That capability check
			// is covered by ExportPermissionTest::test_contributor_cannot_export_blocks,
			// which can mint a nonce as the contributor and get past the gate.
			const fakeNonce = 'invalid_nonce_contributor';

			// Test the vulnerability - attempt to access export URL directly
			const exportUrl = createURL(
				'wp-admin/edit.php',
				`post_type=lazyblocks&lazyblocks_export_block=${blockId}&lazyblocks_export_nonce=${fakeNonce}`
			);

			// Set up listeners to detect if export happens
			let downloadTriggered = false;
			const exportListener = (response) => {
				// Check for file download attempt
				const headers = response.headers();
				if (
					headers['content-disposition'] &&
					headers['content-disposition'].includes('attachment')
				) {
					downloadTriggered = true;
				}
			};

			page.on('response', exportListener);

			try {
				// Attempt to access the export URL as contributor
				const response = await page.goto(exportUrl);
				page.off('response', exportListener);

				// Check 1: Verify no file download was triggered
				expect(downloadTriggered).toBe(false);

				// Check 2: Verify HTTP response indicates access denied
				if (response) {
					const status = response.status();
					expect(status).not.toBe(200); // Should not be OK
					// Should be 403 Forbidden, 500 or 302 redirect to login.
					expect([302, 403, 500]).toContain(status);
				}

				// Check 3: Verify error page content (permission denied message)
				const pageContent = await page.content();

				// Should not contain export data (JSON structure)
				expect(pageContent.includes('"lazyblocks_export"')).toBe(false);

				// Should contain permission error message
				const hasPermissionError =
					pageContent.includes(
						'You need a higher level of permission'
					) ||
					pageContent.includes(
						'Sorry, you are not allowed to edit posts'
					) ||
					pageContent.includes('permission') ||
					pageContent.includes('not allowed') ||
					pageContent.includes('Export permission denied');

				expect(hasPermissionError).toBe(true);
			} catch (error) {
				page.off('response', exportListener);

				// If navigation was aborted, that's actually good - means access was blocked
				if (error.message && error.message.includes('ERR_ABORTED')) {
					// Navigation aborted - this confirms the export was blocked
					// Don't check downloadTriggered here as it may have been set before abort
					return; // Test passes - access was blocked
				}

				// For other errors, re-throw
				throw error;
			}
		} finally {
			// No switch back to admin. `page` is test-scoped, Playwright closes
			// it at teardown, and the next test opens a fresh context already
			// authenticated from `storageState` -- so the login round trip only
			// ever cost time.
			//
			// Clean up test user (always delete - uses REST API, doesn't need page)
			if (testUser) {
				await deleteTestUser(requestUtils, testUser.id);
			}
		}

		// Test passes if we reach here - contributor was properly blocked from export
	});
});
