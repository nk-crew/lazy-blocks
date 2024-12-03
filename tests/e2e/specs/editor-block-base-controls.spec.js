/* eslint-disable jsdoc/no-undefined-types */
/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block with Base control', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	/**
	 * Manually add Base Block.
	 *
	 * @param {Page}         page         Provides methods to interact with a single tab in a Browser, or an extension background page in Chromium.
	 * @param {Editor}       editor       End to end test utilities for the WordPress Block Editor.
	 * @param {Admin}        admin        End to end test utilities for WordPress admin’s user interface.
	 * @param {RequestUtils} requestUtils Playwright utilities for interacting with the WordPress REST API.
	 * @return {number}      blockID      Block ID.
	 */
	async function manuallyAddBaseBlock(page, editor, admin, requestUtils) {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Base Block',
			slug: 'test-base-block',
			code: '<p>Test text control is: <?php echo $attributes["test-text-control"]; ?></p><p>Test select control label is: <?php echo $attributes["test-select-control"]["label"]; ?></p><p>Test select control value is: <?php echo $attributes["test-select-control"]["value"]; ?></p><?php if ( $attributes["test-checkbox-control"] ) : ?><p>The checkbox test control is True</p><?php else: ?><p>The checkbox test control is False</p><?php endif; ?>',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Test Base Block” (Edit)').click();

		await page.waitForTimeout(500);

		const closeModal = await page
			.locator('.components-modal__header')
			.getByRole('button', { name: 'Close' });

		await page.waitForTimeout(500);

		if (await closeModal.isVisible()) {
			await closeModal.click();
		}

		// Generate Text control
		await editor.canvas
			.getByLabel('Inspector Controls')
			.getByRole('button')
			.click();

		await editor.canvas.getByText('(no label)').click();

		await page.getByLabel('Label').fill('Test Text Control');

		await page.getByLabel('Type').click();

		await page.getByRole('button', { name: 'Text', exact: true }).click();

		// Generate Select control
		await editor.canvas
			.getByLabel('Inspector Controls')
			.locator('button.lzb-constructor-controls-item-appender')
			.click();

		await editor.canvas.getByText('(no label)').click();

		await page.getByLabel('Label').fill('Test Select Control');

		await page.getByLabel('Type').click();

		await page.getByRole('button', { name: 'Select' }).click();

		await page.getByRole('button', { name: '+ Add Choice' }).click();
		await page.getByPlaceholder('Label').fill('First Selector Choice');
		await page.getByPlaceholder('Value').fill('first');
		await page.getByRole('button', { name: '+ Add Choice' }).click();

		await page
			.getByPlaceholder('Label')
			.nth(1)
			.fill('Second Selector Choice');

		await page.getByPlaceholder('Value').nth(1).fill('second');

		await page.getByLabel('Both (Array)').check();

		// Generate Checkbox control
		await editor.canvas
			.getByLabel('Inspector Controls')
			.locator('button.lzb-constructor-controls-item-appender')
			.click();

		await editor.canvas.getByText('(no label)').click();

		await page.getByLabel('Label').fill('Test Checkbox Control');
		await page.getByLabel('Type').click();
		await page.getByRole('button', { name: 'Checkbox' }).click();
		await page.locator('#lazyblocks-control-checkbox-checked').check();

		await editor.canvas.getByLabel('PHP').click();

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		return blockID;
	}

	test('create Base block manually in constructor UI', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await manuallyAddBaseBlock(
			page,
			editor,
			admin,
			requestUtils
		);
		// Check for this block in the lazyblocks posts list admin.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator(`#post-${blockID}`)).toBeVisible();
	});

	test('should render Base block correctly', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		await manuallyAddBaseBlock(page, editor, admin, requestUtils);

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test-base-block',
		});

		await page.getByLabel('Test Text Control').fill('Just a text');

		await page.getByLabel('Test Select Control').selectOption('second');

		await page
			.locator(
				'input[type="checkbox"].components-checkbox-control__input'
			)
			.uncheck();

		// Backend render.
		await expect(
			editor.canvas
				.locator('.lzb-preview-server')
				.getByText('Test text control is: Just a text')
		).toBeVisible();

		await expect(
			editor.canvas
				.locator('.lzb-preview-server')
				.getByText(
					'Test select control label is: Second Selector Choice'
				)
		).toBeVisible();

		await expect(
			editor.canvas
				.locator('.lzb-preview-server')
				.getByText('Test select control value is: second')
		).toBeVisible();

		await expect(
			editor.canvas
				.locator('.lzb-preview-server')
				.getByText('The checkbox test control is False')
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
		await expect(
			page.getByText('Test text control is: Just a text')
		).toBeVisible();
		await expect(
			page.getByText(
				'Test select control label is: Second Selector Choice'
			)
		).toBeVisible();
		await expect(
			page.getByText('Test select control value is: second')
		).toBeVisible();
		await expect(
			page.getByText('The checkbox test control is False')
		).toBeVisible();
	});
});
