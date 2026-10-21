/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { openBlockBuilder } from '../utils/block-builder';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('block builder icon picker', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('renders icons in batches, searches, and picks an icon from the keyboard', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Icon Block',
			slug: 'test-icon-block',
			code: '<p>Icon</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		await page
			.locator(
				'.lazyblocks-component-icon-picker-wrapper .lazyblocks-component-icon-picker-button.hover'
			)
			.click();

		const popover = page.locator('.lazyblocks-component-icon-picker');
		const icons = popover.locator(
			'.lazyblocks-component-icon-picker-list .lazyblocks-component-icon-picker-button'
		);

		// The first batch only, not all ~900 icons.
		await expect(icons.first()).toBeVisible();
		const firstBatch = await icons.count();
		expect(firstBatch).toBeLessThan(200);

		// Scrolling to the end renders the next batch.
		await popover.evaluate((el) => {
			el.scrollTop = el.scrollHeight;
		});
		await expect.poll(() => icons.count()).toBeGreaterThan(firstBatch);

		await popover.getByLabel('Search Icon').fill('accessible');
		await expect(icons).toHaveCount(1);

		await icons.first().focus();
		await page.keyboard.press('Enter');

		await expect
			.poll(() =>
				page.evaluate(
					() =>
						wp.data.select('lazy-blocks/block-data').getBlockData()
							.icon
				)
			)
			.toContain('<circle');
		await expect(icons.first()).toHaveClass(
			/lazyblocks-component-icon-picker-button-active/
		);
	});
});
