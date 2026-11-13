/**
 * Opens a new post and waits until the editor has loaded its content.
 *
 * `admin.createNewPost()` returns once the page has loaded, which can be before
 * the editor has set up the post's blocks. A block inserted in between is
 * dropped when that setup runs, and the test then finds an empty canvas.
 *
 * @param {Object} options       Options, passed on to `admin.createNewPost()`.
 * @param {Object} options.admin Admin utils.
 * @param {Object} options.page  Playwright page.
 */
export async function createNewPost({ admin, page, ...options }) {
	await admin.createNewPost(options);

	await page.waitForFunction(() =>
		window.wp.data.select('core/editor').__unstableIsEditorReady()
	);
}
