/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

/**
 * Add block to the current widgetized area.
 *
 * @param {Object} page      page helper functions.
 * @param {string} blockName The block to be added.
 */
async function addBlock(page, blockName) {
	await page.click('role=button[name="Add block"i]');

	const searchBox = page.locator(
		'role=searchbox[name="Search for blocks and patterns"i]'
	);

	// Clear the input.
	await searchBox.evaluate((node) => {
		if (node.value) {
			node.value = '';
		}
	});

	await searchBox.type(blockName);

	await page.click(`role=option`);

	const addedBlock = page.locator(
		'role=document >> css=.is-selected[data-block]'
	);
	await addedBlock.focus();

	const blockId = await addedBlock.getAttribute('data-block');
	const stableSelector = `[data-block="${blockId}"]`;

	return page.locator(stableSelector);
}

test.describe('widgets editor render blocks', () => {
	test.beforeAll(async ({ requestUtils }) => {
		await requestUtils.activateTheme('empty-theme-php');
	});

	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test.afterAll(async ({ requestUtils }) => {
		await requestUtils.activateTheme('empty-theme');
	});

	test('block should be rendered', async ({ page, admin, requestUtils }) => {
		await createBlock({
			requestUtils,
			title: 'Block to render on Widgets screen',
			slug: 'test',
			code: '<p>Hello -- there.</p>',
			codeSingleOutput: true,
		});

		await admin.visitAdminPage('widgets.php');

		// Hide Welcome popup if is is displayed.
		try {
			await page
				.locator('role=button[name="Close"]')
				.click({ timeout: 3000 });
		} catch (error) {}

		await addBlock(page, 'lazyblock/test');

		await expect(page.locator('text="Hello -- there."')).toBeVisible();
	});
});
