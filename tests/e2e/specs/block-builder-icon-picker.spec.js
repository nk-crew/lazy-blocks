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

		await page.getByRole('button', { name: 'Change icon' }).click();

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

	test('the picker from the components store lists icons in the post editor', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		// A registered lazy block makes the post editor load the components store.
		await createBlock({
			requestUtils,
			title: 'Test Icon Store Block',
			slug: 'test-icon-store-block',
			code: '<p>Icon</p>',
		});

		await admin.createNewPost();

		// Render the picker the way third-party controls do.
		await page.evaluate(() => {
			const { createElement, useState } = wp.element;

			wp.blocks.registerBlockType('lzb-e2e/icon-picker', {
				apiVersion: 3,
				title: 'Icon Picker Test',
				category: 'text',
				edit: function Edit() {
					const [icon, setIcon] = useState('');
					const { IconPicker } = wp.data
						.select('lazy-blocks/components')
						.get();

					return createElement(
						'div',
						wp.blockEditor.useBlockProps(),
						createElement(IconPicker, {
							value: icon,
							onChange: setIcon,
						})
					);
				},
				save: () => null,
			});
		});

		expect(
			await page.evaluate(() => typeof window.lazyblocksBlockBuilderData)
		).toBe('undefined');

		await editor.insertBlock({ name: 'lzb-e2e/icon-picker' });

		const iconsRequest = page.waitForResponse((response) =>
			decodeURIComponent(response.url()).includes(
				'/lazy-blocks/v1/get-icons'
			)
		);

		await editor.canvas
			.locator(
				'.lazyblocks-component-icon-picker-wrapper .lazyblocks-component-icon-picker-button.hover'
			)
			.click();

		expect((await iconsRequest).ok()).toBe(true);

		const popover = page.locator('.lazyblocks-component-icon-picker');
		const icons = popover.locator(
			'.lazyblocks-component-icon-picker-list .lazyblocks-component-icon-picker-button'
		);

		await expect(icons.first()).toBeVisible();
		await expect(popover).not.toContainText('No icons found.');

		await popover.getByLabel('Search Icon').fill('accessible');
		await expect(icons).toHaveCount(1);
	});
});
