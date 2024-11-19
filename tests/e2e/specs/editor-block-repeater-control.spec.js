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

	test('create Repeater block manually in constructor UI', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Repeater Block',
			slug: 'test-repeater-block',
			code: '<?php foreach( $attributes["test-repeater-control"] as $inner ): ?><p><?php echo $inner["text-control-nested-in-repeater"]; ?></p><?php endforeach; ?>',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await page.getByLabel('“Test Repeater Block” (Edit)').click();

		await page.getByLabel('Close', { exact: true }).click();

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
			.locator('.lzb-constructor-controls-item-appender')
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

		// Check for this block in the lazyblocks posts list admin.
		await admin.visitAdminPage('edit.php?post_type=lazyblocks');

		await expect(page.locator(`#post-${blockID}`)).toBeVisible();
	});
});
