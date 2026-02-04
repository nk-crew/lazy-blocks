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

		await page.getByRole('button', { name: 'Add' }).click();

		await expect(page.getByLabel('Test pattern')).toBeVisible();

		// Clone reusable block and ensure both blocks displaying correctly.
		await editor.clickBlockToolbarButton('Options');
		await page.click('role=menuitem[name=/Duplicate/i]');

		// Should be loaded 2 blocks with no errors.
		await expect(editor.canvas.locator('text="Hello: there."')).toHaveCount(
			2
		);
	});

	// We should ensure that block ID is unique after duplication.
	// @link https://github.com/nk-crew/lazy-blocks/issues/32
	test('should duplicate block correctly with unique ID', async ({
		editor,
		admin,
		pageUtils,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Simple Block',
			slug: 'test',
			code: '<p>Block ID: {{blockId}}.</p>',
			codeSingleOutput: true,
		});

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		// Wait for the first block ID to be loaded
		const firstBlockIdElement = editor.canvas
			.locator('p:has-text("Block ID:")')
			.first();
		await firstBlockIdElement.waitFor();

		// Wait for the actual ID to be rendered (not just the "Block ID: " text)
		await expect(async () => {
			const text = await firstBlockIdElement.innerText();
			expect(text).toMatch(/Block ID: [a-zA-Z0-9-]+\./);
		}).toPass();

		const firstBlockText = await firstBlockIdElement.innerText();
		const firstBlockId = firstBlockText.match(/Block ID: (.*)\./)?.[1];

		// Ensure first block ID is not empty
		expect(firstBlockId).toBeDefined();
		expect(firstBlockId?.trim()).not.toBe('');

		// Click on the block wrapper to select it
		const blockWrapper = editor.canvas.locator('.wp-block-lazyblock-test');
		await blockWrapper.click();

		// Use keyboard shortcut to duplicate the block (Cmd/Ctrl+Shift+D)
		await pageUtils.pressKeys('primaryShift+d');

		// Wait for both blocks to be loaded
		await expect(
			editor.canvas.locator('p:has-text("Block ID:")')
		).toHaveCount(2);

		// Get the ID of the second block and wait for it to be fully loaded with a unique ID
		let secondBlockId;
		await expect(async () => {
			const secondBlockIdElement = editor.canvas
				.locator('p:has-text("Block ID:")')
				.nth(1);
			const secondBlockText = await secondBlockIdElement.innerText();
			secondBlockId = secondBlockText.match(/Block ID: (.*)\./)?.[1];

			// Ensure the second ID is not empty and is different from the first ID
			expect(secondBlockId).toBeDefined();
			expect(secondBlockId?.trim()).not.toBe('');
			expect(secondBlockId).not.toEqual(firstBlockId);
		}).toPass({ timeout: 5000 });

		// The duplicated block is now selected, duplicate it again
		await pageUtils.pressKeys('primaryShift+d');

		// Wait for all three blocks to be loaded
		await expect(
			editor.canvas.locator('p:has-text("Block ID:")')
		).toHaveCount(3);

		// Get the ID of the third block and wait for it to be fully loaded with a unique ID
		let thirdBlockId;
		await expect(async () => {
			const thirdBlockIdElement = editor.canvas
				.locator('p:has-text("Block ID:")')
				.nth(2);
			const thirdBlockText = await thirdBlockIdElement.innerText();
			thirdBlockId = thirdBlockText.match(/Block ID: (.*)\./)?.[1];

			// Ensure the third ID is not empty and is different from both previous IDs
			expect(thirdBlockId).toBeDefined();
			expect(thirdBlockId?.trim()).not.toBe('');
			expect(thirdBlockId).not.toEqual(firstBlockId);
			expect(thirdBlockId).not.toEqual(secondBlockId);
		}).toPass({ timeout: 5000 });

		// Multiselect all blocks via keyboard
		await pageUtils.pressKeys('primary+a');
		await pageUtils.pressKeys('primary+a');

		// Duplicate all selected blocks using keyboard shortcut
		await pageUtils.pressKeys('primaryShift+d');

		// Now we should have 6 blocks (3 original + 3 duplicated)
		await expect(
			editor.canvas.locator('p:has-text("Block ID:")')
		).toHaveCount(6);

		// Wait for all duplicated blocks to have unique IDs
		// Collect all block IDs after duplication
		await expect(async () => {
			const allBlockElements = await editor.canvas
				.locator('p:has-text("Block ID:")')
				.all();
			const allBlockIds = [];

			for (const element of allBlockElements) {
				const text = await element.innerText();
				const blockId = text.match(/Block ID: (.*)\./)?.[1];

				expect(blockId).toBeDefined();
				expect(blockId?.trim()).not.toBe('');

				allBlockIds.push(blockId);
			}

			// Check that all IDs are unique
			const uniqueIds = [...new Set(allBlockIds)];
			expect(uniqueIds.length).toBe(allBlockIds.length);

			return true;
		}).toPass({ timeout: 10000 });

		// Final verification - get all block IDs and ensure they're all unique
		const allBlockElements = await editor.canvas
			.locator('p:has-text("Block ID:")')
			.all();
		const allBlockIds = [];

		for (const element of allBlockElements) {
			const text = await element.innerText();
			const blockId = text.match(/Block ID: (.*)\./)?.[1];
			allBlockIds.push(blockId);
		}

		// Verify all IDs are unique
		const uniqueBlockIds = [...new Set(allBlockIds)];
		expect(uniqueBlockIds.length).toBe(allBlockIds.length);
		expect(uniqueBlockIds.length).toBe(6);
	});
});
