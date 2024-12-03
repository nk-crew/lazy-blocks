/* eslint-disable jsdoc/no-undefined-types */
/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block with Repeater control', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	/**
	 * Manually add Repeater Block.
	 *
	 * @param {Page}         page         Provides methods to interact with a single tab in a Browser, or an extension background page in Chromium.
	 * @param {Editor}       editor       End to end test utilities for the WordPress Block Editor.
	 * @param {Admin}        admin        End to end test utilities for WordPress admin’s user interface.
	 * @param {RequestUtils} requestUtils Playwright utilities for interacting with the WordPress REST API.
	 * @return {number}      blockID      Block ID.
	 */
	async function manuallyAddRepeaterBlock(page, editor, admin, requestUtils) {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Repeater Block',
			slug: 'test-repeater-block',
			code: '<?php foreach( $attributes["test-repeater-control"] as $inner ): ?><p><?php echo $inner["text-control-nested-in-repeater"]; ?></p><?php endforeach; ?>',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Test Repeater Block” (Edit)').click();

		await page.waitForTimeout(500);

		const closeModal = await page
			.locator('.components-modal__header')
			.getByRole('button', { name: 'Close' });

		await page.waitForTimeout(500);

		if (await closeModal.isVisible()) {
			await closeModal.click();
		}

		await editor.canvas
			.getByLabel('Inspector Controls')
			.getByRole('button')
			.click();

		await editor.canvas.getByText('(no label)').click();

		await page.getByLabel('Label').fill('Test Repeater Control');

		await page.getByLabel('Type').click();

		await page.getByRole('button', { name: 'Repeater' }).click();

		await editor.canvas
			.getByRole('button', { name: 'Show Child Controls' })
			.click();

		await editor.canvas
			.locator('.lzb-block-builder-controls-item-appender')
			.first()
			.click();

		await editor.canvas.getByText('(no label)').click();

		await page.getByLabel('Label').fill('Text control nested in repeater');

		await page.getByLabel('Type').click();

		await page.getByRole('button', { name: 'Text', exact: true }).click();

		await editor.canvas.getByLabel('PHP').click();

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		return blockID;
	}

	test('create Repeater block manually in block builder UI', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await manuallyAddRepeaterBlock(
			page,
			editor,
			admin,
			requestUtils
		);
		// Check for this block in the lazyblocks posts list admin.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator(`#post-${blockID}`)).toBeVisible();
	});

	test('should render Repeater block correctly', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		await manuallyAddRepeaterBlock(page, editor, admin, requestUtils);

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test-repeater-block',
		});

		await page.getByRole('button', { name: '+ Add Row' }).click();
		await page.getByLabel('Text control nested in').click();
		await page.getByLabel('Text control nested in').fill('Test Row 1');
		await page.getByRole('button', { name: '+ Add Row' }).click();
		await page.getByLabel('Text control nested in').click();
		await page.getByLabel('Text control nested in').fill('Test Row 2');
		await page.getByRole('button', { name: '+ Add Row' }).click();
		await page.getByLabel('Text control nested in').click();
		await page.getByLabel('Text control nested in').fill('Test Row 3');

		// Backend render.
		await expect(
			editor.canvas.locator('.lzb-preview-server').getByText('Test Row 1')
		).toBeVisible();

		await expect(
			editor.canvas.locator('.lzb-preview-server').getByText('Test Row 2')
		).toBeVisible();

		await expect(
			editor.canvas.locator('.lzb-preview-server').getByText('Test Row 3')
		).toBeVisible();

		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('link', { name: 'View Post' })
			.click();

		// Frontend render.
		await expect(page.getByText('Test Row 1')).toBeVisible();
		await expect(page.getByText('Test Row 2')).toBeVisible();
		await expect(page.getByText('Test Row 3')).toBeVisible();
	});
});
