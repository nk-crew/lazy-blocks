/* eslint-disable jsdoc/no-undefined-types */
/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { createControl } from '../utils/create-control';
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
		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Text Control',
		});

		// Generate Select control
		await createControl({
			page,
			editor,
			type: 'Select',
			label: 'Test Select Control',
			options: [
				{ label: 'First Selector Choice', value: 'first' },
				{ label: 'Second Selector Choice', value: 'second' },
			],
		});

		await page.getByLabel('Both (Array)').check();

		// Generate Checkbox control
		await createControl({
			page,
			editor,
			type: 'Checkbox',
			label: 'Test Checkbox Control',
			checked: true,
		});

		await editor.canvas
			.locator('#lazyblocks-boxes-code-output-method')
			.click();
		await editor.canvas.getByRole('option', { name: 'PHP' }).click();

		// Publish post.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		return blockID;
	}

	test('create Base block manually in block builder UI', async ({
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
				.getByLabel('Block: Test Base Block')
				.getByText('Test text control is: Just a text')
		).toBeVisible();

		await expect(
			editor.canvas
				.getByLabel('Block: Test Base Block')
				.getByText(
					'Test select control label is: Second Selector Choice'
				)
		).toBeVisible();

		await expect(
			editor.canvas
				.getByLabel('Block: Test Base Block')
				.getByText('Test select control value is: second')
		).toBeVisible();

		await expect(
			editor.canvas
				.getByLabel('Block: Test Base Block')
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
