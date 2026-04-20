/* eslint-disable jsdoc/no-undefined-types */
/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { createControl } from '../utils/create-control';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block with Checkbox (allow multiple) + save in meta', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	/**
	 * Create a block with a multiple checkbox control that saves in meta.
	 *
	 * @param {Page}         page         Provides methods to interact with a single tab in a Browser.
	 * @param {Editor}       editor       End to end test utilities for the WordPress Block Editor.
	 * @param {Admin}        admin        End to end test utilities for WordPress admin's user interface.
	 * @param {RequestUtils} requestUtils Playwright utilities for interacting with the WordPress REST API.
	 * @return {number}      blockID      Block ID.
	 */
	async function createBlockWithMultipleCheckboxMeta(
		page,
		editor,
		admin,
		requestUtils
	) {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Checkbox Meta Block',
			slug: 'test-checkbox-meta-block',
			code: '<?php if ( ! empty( $attributes["test-checkbox-control"] ) && is_array( $attributes["test-checkbox-control"] ) ) : ?><p>Checked: <?php echo esc_html( implode( ", ", $attributes["test-checkbox-control"] ) ); ?></p><?php else : ?><p>Checked: none</p><?php endif; ?>',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page
			.getByRole('link', { name: 'Test Checkbox Meta Block' })
			.first()
			.click();

		await page.waitForTimeout(500);

		const closeModal = await page
			.locator('.components-modal__header')
			.getByRole('button', { name: 'Close' });

		await page.waitForTimeout(500);

		if (await closeModal.isVisible()) {
			await closeModal.click();
		}

		// Create Checkbox control with "Allow Multiple" and choices.
		// Note: We cannot pass options to createControl here because the
		// "+ Add Choice" UI only appears after enabling the "Multiple" toggle.
		await createControl({
			page,
			editor,
			type: 'Checkbox',
			label: 'Test Checkbox Control',
		});

		// Enable "Multiple" toggle.
		await page
			.locator('#lzb-control-select-multiple input[type="checkbox"]')
			.check();

		// Add choices for the multiple checkbox.
		await page.getByRole('button', { name: '+ Add Choice' }).click();
		await page.getByPlaceholder('Label').nth(1).fill('Option A');
		await page.getByPlaceholder('Value').nth(0).fill('option_a');

		await page.getByRole('button', { name: '+ Add Choice' }).click();
		await page.getByPlaceholder('Label').nth(2).fill('Option B');
		await page.getByPlaceholder('Value').nth(1).fill('option_b');

		await page.getByRole('button', { name: '+ Add Choice' }).click();
		await page.getByPlaceholder('Label').nth(3).fill('Option C');
		await page.getByPlaceholder('Value').nth(2).fill('option_c');

		// Enable "Save in Meta" - locate the BaseControl wrapper containing the toggle.
		const saveInMetaPanel = page
			.locator('.components-base-control')
			.filter({
				has: page.locator('.components-base-control__label', {
					hasText: 'Save in Meta',
				}),
			});
		await saveInMetaPanel.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);
		await saveInMetaPanel.locator('input[type="checkbox"]').first().check();

		// Set output method to PHP.
		await editor.canvas
			.locator('#lazyblocks-boxes-code-output-method')
			.click();
		await editor.canvas.getByRole('option', { name: 'PHP' }).click();

		// Publish / save the block.
		await page.locator('role=button[name="Save"i]').click();

		await expect(page.locator('role=button[name="Save"i]')).toBeDisabled();

		return blockID;
	}

	test('should save and persist multiple checkbox values in meta', async ({
		page,
		editor,
		admin,
		requestUtils,
		context,
	}) => {
		await createBlockWithMultipleCheckboxMeta(
			page,
			editor,
			admin,
			requestUtils
		);

		// Create a new post and insert the block.
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test-checkbox-meta-block',
		});

		// Wait for checkbox controls to appear in the sidebar.
		const optionA = page.getByLabel('Option A');
		await optionA.waitFor({ state: 'visible', timeout: 15000 });

		// Check two of the three checkboxes.
		await optionA.check();
		await page.getByLabel('Option C').check();

		// Wait for block preview to update.
		const blockLocator = editor.canvas.locator(
			'.wp-block-lazyblock-test-checkbox-meta-block'
		);

		await expect(
			blockLocator.getByText('Checked: option_a, option_c')
		).toBeVisible({ timeout: 10000 });

		// Publish the post.
		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		// Wait for publish confirmation.
		await expect(
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
		).toBeVisible({ timeout: 10000 });

		// View Post in a new tab.
		const [frontendPage] = await Promise.all([
			context.waitForEvent('page'),
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
				.click(),
		]);

		await frontendPage.waitForLoadState('domcontentloaded');

		// Verify meta values persisted on the frontend.
		await expect(
			frontendPage.getByText('Checked: option_a, option_c')
		).toBeVisible();

		// Go back to the editor and reload the post to verify values persist.
		const postUrl = page.url();
		await page.goto(postUrl);

		// Wait for the editor to load and verify block preview shows correct values.
		await expect(
			editor.canvas
				.locator('.wp-block-lazyblock-test-checkbox-meta-block')
				.getByText('Checked: option_a, option_c')
		).toBeVisible({ timeout: 15000 });

		// Select the block to reveal inspector controls with checkboxes.
		await editor.canvas
			.locator('.wp-block-lazyblock-test-checkbox-meta-block')
			.click();

		// Verify that the checkboxes are still checked after reload.
		await expect(page.getByLabel('Option A')).toBeChecked({
			timeout: 15000,
		});
		await expect(page.getByLabel('Option B')).not.toBeChecked();
		await expect(page.getByLabel('Option C')).toBeChecked();
	});
});
