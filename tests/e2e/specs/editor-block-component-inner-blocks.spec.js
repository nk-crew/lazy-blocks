/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block component <InnerBlocks />', () => {
	// One block for the file. All three tests created a byte-identical one and
	// none of them mutates it, so the only thing per-test creation bought was
	// three extra REST round trips. The teardown stays -- leaving a
	// `lazyblock/test` registration behind would follow the worker into the next
	// spec file.
	test.beforeAll(async ({ requestUtils }) => {
		await createBlock({
			requestUtils,
			title: 'Block with InnerBlocks',
			slug: 'test',
			code: '<p>Hello:</p><InnerBlocks /><p>there.</p>',
			codeSingleOutput: true,
		});
	});

	test.afterAll(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('should render block template correctly', async ({
		editor,
		admin,
	}) => {
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		await expect(editor.canvas.locator('text="Hello:"')).toBeVisible();
		await expect(editor.canvas.locator('text="there."')).toBeVisible();
	});

	test('should hide the appender if block is not selected', async ({
		page,
		editor,
		admin,
	}) => {
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		const $appender = editor.canvas.locator(
			'.lazyblock-inner-blocks .block-editor-button-block-appender'
		);
		await expect($appender).toBeAttached();

		// When block is just inserted, it is focused by default, so we have to check if appended is visible.
		await expect($appender).toBeVisible();

		// Add random paragraph.
		await editor.insertBlock({ name: 'core/paragraph' });
		await page.keyboard.type('Just a random paragraph');

		// Once random paragraph added, our block should hide the InnerBlocks appender.
		await expect($appender).toBeHidden();
	});

	test('nested inner blocks should keep hidden appender if parent block is selected', async ({
		editor,
		admin,
	}) => {
		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
			innerBlocks: [{ name: 'lazyblock/test' }],
		});

		const $innerAppender = editor.canvas.locator(
			'.lazyblock-inner-blocks .lazyblock-inner-blocks .block-editor-button-block-appender'
		);
		await expect($innerAppender).toBeAttached();

		// When block is just inserted, it is focused by default, so we have to check if inner block appended is hidden.
		await expect($innerAppender).toBeHidden();

		// Select the inner block.
		await editor.canvas
			.locator('.wp-block-lazyblock-test .wp-block-lazyblock-test')
			.click();

		// Once inner block focused, our block should show the InnerBlocks appender.
		await expect($innerAppender).toBeVisible();
	});
});
