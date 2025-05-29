/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { createControl } from '../utils/create-control';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block with frame and content controls', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('should render frame in editor when there are content control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Block with frame” (Edit)').click();

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
			placement: 'content',
		});

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		// Check block in editor.
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toBeVisible();
	});

	test('should render frame in editor when there are content and inspector control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Block with frame” (Edit)').click();

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
			placement: 'both',
		});

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		// Check block in editor.
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toBeVisible();
	});

	test('should not render frame in editor when there are only inspector control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Block with frame” (Edit)').click();

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
		});

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		// Check block in editor.
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		await expect(
			editor.canvas.locator(
				'.wp-block-lazyblock-test:text("Hello There")'
			)
		).toBeVisible();

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toHaveCount(0);
	});
});
