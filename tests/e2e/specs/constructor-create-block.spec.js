/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('constructor create block', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('make sure editor API is available in constructor UI', async ({
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

	test('create block manually in constructor UI', async ({
		page,
		editor,
		admin,
	}) => {
		await admin.createNewPost({
			postType: 'lazyblocks',
			title: 'Test Block',
			status: 'publish',
		});

		const slugInput = await page.$$(
			'.lazyblocks-component-block-slug input'
		);

		for (const input of slugInput) {
			if (await input.isVisible()) {
				await input.fill('test');
				break; // Stop after finding and filling the first visible input
			}
		}

		// Enable single code output.
		await editor.canvas
			.locator(
				'label:has-text("Single output code for Frontend and Editor")'
			)
			.click();

		// Add block code.
		await editor.canvas
			.locator('textarea.ace_text-input')
			.fill('Hello there');

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
