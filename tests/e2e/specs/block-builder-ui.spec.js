/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { openBlockBuilder } from '../utils/block-builder';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

function getBlockData(page) {
	return page.evaluate(() =>
		window.wp.data.select('lazy-blocks/block-data').getBlockData()
	);
}

function getSelectedControl(page) {
	return page.evaluate(() =>
		window.wp.data.select('lazy-blocks/block-data').getSelectedControl()
	);
}

test.describe('block builder interface', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('adds controls from the type picker with search and keyboard', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Add Control Block',
			slug: 'test-add-control-block',
			code: '<p>Add</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		// An empty list shows only the add button.
		const emptyState = editor.canvas.locator(
			'.lzb-block-builder-controls-empty'
		);
		await expect(emptyState).toHaveText('');
		await emptyState
			.getByRole('button', { name: 'Add control', exact: true })
			.click();

		// The picker reuses the block inserter layout.
		await expect(
			page.locator(
				'.lzb-control-type-picker.block-editor-inserter__quick-inserter'
			)
		).toBeVisible();
		const search = page.getByRole('searchbox', {
			name: 'Search control types',
		});
		await expect(search).toBeFocused();
		await search.fill('gal');
		await page.keyboard.press('Enter');

		const label = page.locator('#lazyblocks-settings-row-label');
		await expect(label).toBeFocused();
		await expect(label).toHaveValue('Gallery');
		expect(
			await label.evaluate((el) => [el.selectionStart, el.selectionEnd])
		).toEqual([0, 'Gallery'.length]);

		let control = await getSelectedControl(page);
		expect(control.type).toBe('gallery');
		expect(control.name).toBe('gallery');
		expect(control.placement).toBe('inspector');

		// Typing a label renames the new control.
		await page.keyboard.type('Photos');
		await expect(
			editor.canvas.locator('.lzb-block-builder-controls-item-name')
		).toHaveText('photos');

		// Arrow keys move across the tiles, Enter picks one.
		await editor.canvas
			.getByRole('button', { name: 'Add control', exact: true })
			.click();
		await expect(search).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(
			page.getByRole('button', { name: 'Text', exact: true }).first()
		).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');

		await expect(label).toBeFocused();
		await expect(label).toHaveValue('Image');
		control = await getSelectedControl(page);
		expect(control.type).toBe('image');

		const data = await getBlockData(page);
		expect(
			Object.values(data.controls).map((item) => [item.type, item.name])
		).toEqual([
			['gallery', 'photos'],
			['image', 'image'],
		]);

		// Arrow keys move the selection through the list and keep the focus there.
		const rowLabels = editor.canvas.locator(
			'.lzb-block-builder-controls-item-label'
		);
		await rowLabels.first().focus();
		await page.keyboard.press('ArrowDown');
		await expect
			.poll(async () => (await getSelectedControl(page)).name)
			.toBe('image');
		await expect(rowLabels.nth(1)).toBeFocused();
		await page.keyboard.press('ArrowUp');
		await expect
			.poll(async () => (await getSelectedControl(page)).name)
			.toBe('photos');
	});

	test('groups the control settings and labels the toggles', async ({
		page,
		context,
		editor,
		admin,
		requestUtils,
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		const blockID = await createBlock({
			requestUtils,
			title: 'Test Control Inspector Block',
			slug: 'test-control-inspector-block',
			code: '<p>{{title}}</p>',
			controls: {
				control_title: {
					type: 'text',
					name: 'title',
					label: 'Title',
					placement: 'content',
					child_of: '',
					required: 'true',
				},
			},
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		await editor.canvas
			.getByRole('radio', { name: 'Content Controls' })
			.click();
		await editor.canvas
			.locator('.lzb-block-builder-controls-item-label', {
				hasText: 'Title',
			})
			.click();

		const sidebar = page.locator(
			'.lzb-block-builder-controls-item-settings'
		);

		// Header: label and type.
		const header = sidebar.locator('.lzb-block-builder-control-card');
		await expect(header.getByRole('heading')).toHaveText('Title');
		await expect(header.locator('code')).toHaveCount(0);

		// The name in the list copies itself and shows a check for a second.
		const copyName = editor.canvas.getByRole('button', {
			name: 'Copy name title',
		});
		await copyName.click();
		await expect(
			editor.canvas.getByRole('button', { name: 'Copied' })
		).toBeVisible();
		expect(
			await page.evaluate(() => window.navigator.clipboard.readText())
		).toBe('title');
		await expect(copyName).toBeVisible({ timeout: 3000 });

		// Three groups instead of a panel per setting.
		await expect(
			sidebar.getByRole('button', { name: 'Settings', exact: true })
		).toBeVisible();
		await expect(
			sidebar.getByRole('button', { name: 'Layout', exact: true })
		).toBeVisible();
		await expect(
			sidebar.getByRole('heading', { name: 'Behavior' })
		).toBeVisible();
		await expect(
			sidebar.getByRole('radio', { name: 'Inspector', exact: true })
		).toBeVisible();
		await expect(sidebar).not.toContainText('Lazy Blocks Pro');

		// Behavior shows the toggles in use, the menu adds the others.
		await expect(
			sidebar.getByRole('checkbox', { name: 'Required' })
		).toBeChecked();
		await sidebar.getByRole('button', { name: 'Behavior options' }).click();
		await page
			.getByRole('menuitemcheckbox', {
				name: 'Hide until the block is selected',
			})
			.click();
		await page.keyboard.press('Escape');
		await sidebar
			.getByRole('checkbox', { name: 'Hide until the block is selected' })
			.check();

		let control = await getSelectedControl(page);
		expect(control.hide_if_not_selected).toBe('true');

		// Placement as a segmented control.
		await sidebar.getByRole('radio', { name: 'Both', exact: true }).click();
		control = await getSelectedControl(page);
		expect(control.placement).toBe('both');

		// The type changes from the header.
		await header.getByRole('button', { name: /Change type/ }).click();
		await page
			.getByRole('searchbox', { name: 'Search control types' })
			.fill('Text Area');
		await page
			.getByRole('button', { name: 'Text Area', exact: true })
			.click();
		control = await getSelectedControl(page);
		expect(control.type).toBe('textarea');
		expect(control.name).toBe('title');
	});

	test('shows changed supports only and resets them', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Supports Block',
			slug: 'test-supports-block',
			code: '<p>Supports</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		const supports = page.locator('.lzb-block-builder-supports');

		// All supports use their defaults, so no toggle is shown.
		await expect(supports.getByRole('checkbox')).toHaveCount(0);

		await supports
			.getByRole('button', { name: 'Supports options' })
			.click();

		// The menu lists the supports A-Z.
		const menuLabels = await page
			.getByRole('menuitemcheckbox')
			.allTextContents();
		expect(menuLabels.length).toBeGreaterThan(1);
		expect(menuLabels).toEqual(
			[...menuLabels].sort((a, b) => a.localeCompare(b))
		);

		await page.getByRole('menuitemcheckbox', { name: 'Anchor' }).click();
		await page.keyboard.press('Escape');

		await supports.getByRole('checkbox', { name: 'Anchor' }).check();
		expect((await getBlockData(page)).supports_anchor).toBe(true);

		await supports
			.getByRole('button', { name: 'Supports options' })
			.click();
		await page.getByRole('menuitem', { name: 'Reset all' }).click();

		expect((await getBlockData(page)).supports_anchor).toBe(false);
		await expect(supports.getByRole('checkbox')).toHaveCount(0);

		// Ghost Kit supports work the same way.
		const ghostKit = page.locator('.lzb-block-builder-supports-ghost-kit');
		await expect(ghostKit.getByRole('checkbox')).toHaveCount(0);
		await ghostKit
			.getByRole('button', { name: 'Supports Ghost Kit options' })
			.click();
		await page.getByRole('menuitemcheckbox', { name: 'Effects' }).click();
		await page.keyboard.press('Escape');
		await ghostKit.getByRole('checkbox', { name: 'Effects' }).check();
		expect((await getBlockData(page)).supports_ghostkit_effects).toBe(true);
	});

	test('edits the slug in the block card', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Card Block',
			slug: 'test-card-block',
			description: 'Card description',
			code: '<p>Card</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		const card = page.locator('.lzb-block-builder-block-card');
		await expect(card.getByRole('heading')).toHaveText('Test Card Block');
		await expect(card).toContainText('Card description');
		await expect(card.locator('code')).toHaveText(
			'lazyblock/test-card-block'
		);

		await card.getByRole('button', { name: 'Edit slug' }).click();
		const slugInput = card.getByRole('textbox', { name: 'Slug' });
		await expect(slugInput).toBeFocused();
		await slugInput.fill('renamed-card');
		await page.keyboard.press('Enter');

		await expect(card.locator('code')).toHaveText('lazyblock/renamed-card');
		expect((await getBlockData(page)).slug).toBe('renamed-card');
	});

	test('types into style variations and removes them', async ({
		page,
		editor,
		admin,
		requestUtils,
	}) => {
		const blockID = await createBlock({
			requestUtils,
			title: 'Test Style Variations Block',
			slug: 'test-style-variations-block',
			code: '<p>Styles</p>',
		});

		await openBlockBuilder({ page, editor, admin, blockID });

		await page
			.getByRole('button', { name: 'Style Variations', exact: true })
			.click();
		const addButton = page.getByRole('button', {
			name: '+ Add Style Variation',
		});
		const rows = page.locator(
			'.lzb-block-builder-controls-item-settings-choices-item'
		);

		// Type key by key: every keystroke must reach the input, not only the store.
		await addButton.click();
		await rows.nth(0).getByPlaceholder('Name').pressSequentially('outline');
		await rows
			.nth(0)
			.getByPlaceholder('Label')
			.pressSequentially('Outline');
		await addButton.click();
		await rows.nth(1).getByPlaceholder('Name').pressSequentially('solid');

		await expect(rows.nth(0).getByPlaceholder('Name')).toHaveValue(
			'outline'
		);
		await expect(rows.nth(0).getByPlaceholder('Label')).toHaveValue(
			'Outline'
		);
		await expect(rows.nth(1).getByPlaceholder('Name')).toHaveValue('solid');
		expect((await getBlockData(page)).styles).toEqual([
			{ name: 'outline', label: 'Outline' },
			{ name: 'solid', label: '' },
		]);

		await rows
			.nth(0)
			.locator(
				'.lzb-block-builder-controls-item-settings-choices-item-remove'
			)
			.click();

		await expect(rows).toHaveCount(1);
		await expect(rows.nth(0).getByPlaceholder('Name')).toHaveValue('solid');
		expect((await getBlockData(page)).styles).toEqual([
			{ name: 'solid', label: '' },
		]);
	});
});
