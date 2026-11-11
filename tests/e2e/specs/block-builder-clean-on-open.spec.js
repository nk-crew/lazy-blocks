/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { openBlockBuilder } from '../utils/block-builder';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

function exampleControl(type, name, label) {
	return {
		type,
		name,
		default: '',
		label,
		help: '',
		child_of: '',
		placement: 'inspector',
		width: '100',
		hide_if_not_selected: 'false',
		save_in_meta: 'false',
		save_in_meta_name: '',
		required: 'false',
		placeholder: '',
		characters_limit: '',
	};
}

const EXAMPLE_CONTROLS = {
	control_005ad74de2: exampleControl('image', 'image', 'Image'),
	control_1729664f06: exampleControl('text', 'button-label', 'Button Label'),
	control_8b591545a2: exampleControl('url', 'button-url', 'Button URL'),
};

function getEditorState(page) {
	return page.evaluate(() => ({
		dirty: window.wp.data.select('core/editor').isEditedPostDirty(),
		undo: window.wp.data.select('core/editor').hasEditorUndo(),
	}));
}

test.describe('block builder unsaved changes', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	for (const [name, controls] of [
		['without controls', undefined],
		['with the example block controls', EXAMPLE_CONTROLS],
	]) {
		test(`a block ${name} opens with nothing to save or undo`, async ({
			page,
			editor,
			admin,
			requestUtils,
		}) => {
			const blockID = await createBlock({
				requestUtils,
				title: 'Test Clean Open Block',
				slug: 'test-clean-open-block',
				code: '<p>Clean</p>',
				controls,
			});

			await openBlockBuilder({ page, editor, admin, blockID });

			// The builder reports a block data change to the editor 150 ms after
			// it happens, so a change made while loading needs that long to show.
			await page.waitForTimeout(500);

			expect(await getEditorState(page)).toEqual({
				dirty: false,
				undo: false,
			});
			const builderBlockSelected = await page.evaluate(() => {
				const blockEditor = window.wp.data.select('core/block-editor');
				const blocks = blockEditor.getBlocks();
				return (
					blocks.length === 1 &&
					blockEditor.getSelectedBlockClientId() ===
						blocks[0].clientId
				);
			});
			expect(builderBlockSelected).toBe(true);
		});
	}

	test('a block data change after opening still asks to save', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Dirty Edit Block',
			slug: 'test-dirty-edit-block',
			code: '<p>Dirty</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		await page.evaluate(() =>
			window.wp.data
				.dispatch('lazy-blocks/block-data')
				.updateBlockData({ description: 'Changed' })
		);

		await expect
			.poll(async () => (await getEditorState(page)).dirty)
			.toBe(true);
		await expect(
			page.getByRole('button', { name: 'Save', exact: true })
		).toBeEnabled();
	});

	test('undoing the first change leaves nothing else to undo', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Undo Block',
			slug: 'test-undo-block',
			code: '<p>Undo</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		await page.evaluate(() =>
			window.wp.data
				.dispatch('lazy-blocks/block-data')
				.updateBlockData({ description: 'Changed' })
		);
		await expect
			.poll(async () => (await getEditorState(page)).undo)
			.toBe(true);

		await page.evaluate(() =>
			window.wp.data.dispatch('core/editor').undo()
		);

		expect(await getEditorState(page)).toEqual({
			dirty: false,
			undo: false,
		});
	});

	test('a removed builder block comes back selected', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Restore Block',
			slug: 'test-restore-block',
			code: '<p>Restore</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		const removedClientId = await page.evaluate(() => {
			const blockEditor = window.wp.data.select('core/block-editor');
			const [block] = blockEditor.getBlocks();
			window.wp.data
				.dispatch('core/block-editor')
				.removeBlock(block.clientId);
			return block.clientId;
		});

		await expect
			.poll(() =>
				page.evaluate(() => {
					const selected = window.wp.data
						.select('core/block-editor')
						.getSelectedBlock();
					return selected && [selected.name, selected.clientId];
				})
			)
			.toEqual([
				'lzb-block-builder/main',
				expect.not.stringMatching(`^${removedClientId}$`),
			]);
	});
});
