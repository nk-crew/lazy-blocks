/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { openBlockBuilder } from '../utils/block-builder';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('block builder tabs', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('keeps each tab icon and label on one line', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Tabs Block',
			slug: 'test-tabs-block',
			code: '<p>Tabs</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		// Content Controls, Inspector Controls, the code files and Preview.
		const tabs = editor.canvas.locator(
			'.lazyblocks-control-tabs-tab:visible:has(svg)'
		);
		await expect(tabs.first()).toBeVisible();
		expect(await tabs.count()).toBeGreaterThanOrEqual(4);

		const layouts = await tabs.evaluateAll((elements) =>
			elements.map((tab) => {
				const svg = tab.querySelector('svg');
				const icon = svg.getBoundingClientRect();
				const label = document.createRange();
				label.selectNodeContents(svg.parentNode);
				label.setStartAfter(svg);

				return {
					text: tab.textContent.trim(),
					iconTop: icon.top,
					iconBottom: icon.bottom,
					lines: [...label.getClientRects()].map((rect) => ({
						top: rect.top,
						bottom: rect.bottom,
					})),
				};
			})
		);

		for (const { text, iconTop, iconBottom, lines } of layouts) {
			// Every line box of the label overlaps the icon vertically, so the
			// label sits beside the icon instead of wrapping below it.
			expect(lines.length, text).toBeGreaterThan(0);
			for (const line of lines) {
				expect(line.top, text).toBeLessThan(iconBottom);
				expect(line.bottom, text).toBeGreaterThan(iconTop);
			}
		}
	});
});
