/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';
import { removeReusableBlocks } from '../utils/remove-reusable-blocks';

test.describe('editor block rendering', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeReusableBlocks({ requestUtils });
		await removeAllBlocks({ requestUtils });
	});

	// Since Gutenberg v16.3 our Save function stop working correctly, this is why we have to test it.
	// @link https://github.com/nk-crew/lazy-blocks/issues/293
	test('should render block inside core/group correctly', async ({
		editor,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Simple Block',
			slug: 'test',
			code: '<p>Hello: there.</p>',
			codeSingleOutput: true,
		});

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'core/group',
			attributes: {
				layout: { type: 'constrained' },
			},
			innerBlocks: [{ name: 'lazyblock/test' }],
		});

		await expect(
			editor.canvas.locator('text="Hello: there."')
		).toBeVisible();
	});

	// Since Gutenberg v16.3 reusable blocks and unique block ID code stop working correctly.
	// @link https://wordpress.org/support/topic/js-error-when-selecting-custom-lazy-blocks-in-gutenberg-after-updating-wp-to-6-3/
	test('should render reusable block correctly', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Simple Block',
			slug: 'test',
			code: '<p>Hello: there.</p>',
			codeSingleOutput: true,
		});

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'core/group',
			attributes: {
				layout: { type: 'constrained' },
			},
			innerBlocks: [{ name: 'lazyblock/test' }],
		});

		// Create reusable block.
		await editor.clickBlockToolbarButton('Options');

		await page.click('role=menuitem[name=/Create pattern/i]');

		await page.getByPlaceholder('My pattern').fill('Test pattern');

		await page.getByRole('button', { name: 'Create' }).click();

		await expect(page.getByLabel('Test pattern')).toBeVisible();

		// Clone reusable block and ensure both blocks displaying correctly.
		await editor.clickBlockToolbarButton('Options');
		await page.click('role=menuitem[name=/Duplicate/i]');

		// Should be loaded 2 blocks with no errors.
		await expect(editor.canvas.locator('text="Hello: there."')).toHaveCount(
			2
		);
	});
});
