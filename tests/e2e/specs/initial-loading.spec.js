/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('initial loading', () => {
	test('should have lazy blocks in admin menu', async ({ page, admin }) => {
		await admin.visitAdminPage('index.php');

		await expect(page.locator('#menu-posts-lazyblocks')).toBeVisible();
	});

	test('should have example block added', async ({ page, admin }) => {
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator('a:has-text("Example Block")')).toBeVisible();
	});
});
