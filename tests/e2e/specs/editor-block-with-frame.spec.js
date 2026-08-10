/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import {
	insertLazyBlock,
	openBlockBuilder,
	saveBlockBuilder,
} from '../utils/block-builder';
import { createBlock } from '../utils/create-block';
import { createControl } from '../utils/create-control';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block with frame and content controls', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('should render frame in editor when there are content control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await openBlockBuilder({ page, editor, admin, blockID });

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
			placement: 'content',
		});

		// Publish post.
		await saveBlockBuilder({ page });

		// Check block in editor.
		await admin.createNewPost();

		await insertLazyBlock({ page, editor, name: 'lazyblock/test' });

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toBeVisible({ timeout: 15000 });
	});

	test('should render frame in editor when there are content and inspector control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await openBlockBuilder({ page, editor, admin, blockID });

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
			placement: 'both',
		});

		// Publish post.
		await saveBlockBuilder({ page });

		// Check block in editor.
		await admin.createNewPost();

		await insertLazyBlock({ page, editor, name: 'lazyblock/test' });

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toBeVisible({ timeout: 15000 });
	});

	test('should not render frame in editor when there are only inspector control', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Block with frame',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		// Create control.
		await openBlockBuilder({ page, editor, admin, blockID });

		await createControl({
			page,
			editor,
			type: 'Text',
			label: 'Test Content Control',
		});

		// Publish post.
		await saveBlockBuilder({ page });

		// Check block in editor.
		await admin.createNewPost();

		await insertLazyBlock({ page, editor, name: 'lazyblock/test' });

		await expect(
			editor.canvas.locator(
				'.wp-block-lazyblock-test:text("Hello There")'
			)
		).toBeVisible({ timeout: 15000 });

		await expect(
			editor.canvas
				.locator('.lazyblock .lzb-content-title')
				.filter({ hasText: 'Block with frame' })
		).toHaveCount(0);
	});
});
