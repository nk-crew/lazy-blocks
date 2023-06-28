/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('admin-menu', () => {
	test('should have lazy blocks in admin menu', async ({
		page,
		admin,
		requestUtils,
	}) => {
		await requestUtils.activatePlugin('lazy-blocks');
		await admin.visitAdminPage('index.php');

		await expect(page.locator('#menu-posts-lazyblocks')).toBeVisible();
	});
});
