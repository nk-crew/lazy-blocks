/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block rendering', () => {
	test.afterEach(async ({ requestUtils }) => {
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
});
