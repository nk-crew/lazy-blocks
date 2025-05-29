/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('block builder create block', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('make sure editor API is available in block builder UI', async ({
		page,
		admin,
	}) => {
		// We should add this API always even when no blocks available.
		// It is used in the Pro plugin controls.
		await admin.visitAdminPage('post-new.php?post_type=lazyblocks');

		const apiAvailable = await page.evaluate(async () => {
			return !!wp.data.select('lazy-blocks/components');
		});

		await expect(apiAvailable).toEqual(true);
	});

	test('create block manually in block builder UI', async ({
		page,
		editor,
		admin,
	}) => {
		await admin.createNewPost({
			postType: 'lazyblocks',
			title: '',
			status: 'publish',
		});

		await editor.canvas.getByRole('button', { name: 'Continue' }).click();

		await editor.canvas
			.getByLabel('Title', { exact: true })
			.fill('Test Block');

		await editor.canvas.getByRole('button', { name: 'Continue' }).click();

		await editor.canvas.getByRole('button', { name: 'Finish' }).click();

		// Publish post.
		await page.locator('role=button[name="Publish"i]').click();
		await page
			.locator('role=region[name="Editor publish"]')
			.locator('role=button[name="Publish"i]')
			.click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		let postID = await page.locator('input[name="post_ID"]').inputValue();
		postID = typeof postID === 'string' ? parseInt(postID, 10) : null;

		// Check for this block in the lazyblocks posts list admin.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator(`#post-${postID}`)).toBeVisible();
	});
});
