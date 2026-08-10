/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Opens an existing block in the block builder UI, ready to be edited.
 *
 * Navigating to an existing post is not the same as `admin.createNewPost()`:
 * that helper turns the welcome guide off for us, a plain navigation does not.
 * The guide renders a modal whose overlay covers the whole editor and swallows
 * every click on the canvas, so the builder must be opened through here.
 *
 * @param {Object} options         Options.
 * @param {Object} options.page    Playwright page.
 * @param {Object} options.editor  Block editor utils.
 * @param {Object} options.admin   Admin utils.
 * @param {number} options.blockID ID of the block post to open.
 */
export async function openBlockBuilder({ page, editor, admin, blockID }) {
	await admin.visitAdminPage('edit.php?post_type=lazyblocks');

	await page.locator(`#post-${blockID} .row-title`).click();

	// `click()` returns once the click is dispatched, not once the navigation it
	// starts has finished. Settle on the editor before running anything in the
	// page, or it runs against a context that is about to be destroyed.
	await page.waitForURL(/post\.php/);

	// The builder lives inside the editor canvas iframe and is mounted by the
	// `lzb-block-builder/main` block, which the plugin inserts itself. Waiting
	// for it also means the editor stores are up, ready for `setPreferences`.
	await expect(editor.canvas.getByLabel('Add Control')).toBeVisible();

	await editor.setPreferences('core/edit-post', {
		welcomeGuide: false,
		fullscreenMode: false,
	});

	// The preference unmounts the guide, but only once React has re-rendered.
	// Wait for that rather than guessing at how long it takes: until the overlay
	// is gone it swallows every click aimed at the canvas underneath it.
	await expect(page.locator('.components-modal__screen-overlay')).toHaveCount(
		0
	);
}

/**
 * Saves the block currently open in the block builder, and waits for its data
 * to actually reach the database.
 *
 * The builder does not store controls with the post. It listens for the post
 * save to finish and only then POSTs the block data to
 * `/lazy-blocks/v1/update-block-data/` (see
 * `assets/block-builder/plugin/index.js`). Nothing in the editor UI reflects
 * that second request: the Save button is already disabled while it is still in
 * flight. Navigating away on the button alone aborts the write, and the next
 * page then registers the block without its controls — no frame, no inspector
 * controls, no rendered output.
 *
 * @param {Object} options      Options.
 * @param {Object} options.page Playwright page.
 */
export async function saveBlockBuilder({ page }) {
	const saveButton = page.locator('role=button[name="Save"i]');

	// Subscribe before the click, so a fast response cannot be missed.
	const blockDataSaved = page.waitForResponse(
		(response) =>
			response.url().includes('update-block-data') &&
			response.request().method() === 'POST'
	);

	await saveButton.click();

	await expect(saveButton).toBeDisabled();

	const response = await blockDataSaved;

	expect(response.ok()).toBe(true);
}

/**
 * Inserts a block registered by Lazy Blocks into the current post.
 *
 * `editor.insertBlock()` only waits for `wp.blocks` to exist, which happens
 * before the Lazy Blocks bundle has run its `registerBlockType()` calls. Insert
 * too early and the block is created as an unregistered one, which renders
 * nothing and fails later on an unrelated-looking assertion.
 *
 * @param {Object} options        Options.
 * @param {Object} options.page   Playwright page.
 * @param {Object} options.editor Block editor utils.
 * @param {string} options.name   Block name, e.g. `lazyblock/test`.
 */
export async function insertLazyBlock({ page, editor, name }) {
	await expect
		.poll(
			() =>
				page.evaluate(
					(blockName) => !!window.wp?.blocks?.getBlockType(blockName),
					name
				),
			{
				message: `Block type "${name}" was never registered in the editor.`,
			}
		)
		.toBe(true);

	await editor.insertBlock({ name });
}
