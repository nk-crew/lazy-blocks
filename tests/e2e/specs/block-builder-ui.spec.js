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

		// An empty list offers the common types.
		const emptyState = editor.canvas.locator(
			'.lzb-block-builder-controls-empty'
		);
		await expect(emptyState).toContainText('No inspector controls yet');
		await expect(
			emptyState.getByRole('button', { name: 'Text', exact: true })
		).toBeVisible();
		await expect(
			emptyState.getByRole('button', { name: 'Image', exact: true })
		).toBeVisible();
		await expect(
			emptyState.getByRole('button', { name: 'Repeater', exact: true })
		).toBeVisible();

		// Search and pick with Enter.
		await emptyState.getByRole('button', { name: 'Browse all' }).click();
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
			page.locator('.lzb-block-builder-control-card-name code')
		).toHaveText('{{photos}}');

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
		editor,
		admin,
		requestUtils,
	}) => {
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
			.getByRole('tab', { name: 'Content Controls' })
			.click();
		await editor.canvas
			.locator('.lzb-block-builder-controls-item-label', {
				hasText: 'Title',
			})
			.click();

		const sidebar = page.locator(
			'.lzb-block-builder-controls-item-settings'
		);

		// Header: label, type and the template variable.
		const header = sidebar.locator('.lzb-block-builder-control-card');
		await expect(header.getByRole('heading')).toHaveText('Title');
		await expect(header.locator('code')).toHaveText('{{title}}');
		await expect(
			header.getByRole('button', { name: 'Copy name' })
		).toBeVisible();

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
});
