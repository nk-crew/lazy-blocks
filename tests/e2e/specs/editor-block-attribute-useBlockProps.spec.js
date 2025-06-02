/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { createBlock } from '../utils/create-block';
import { removeAllBlocks } from '../utils/remove-all-blocks';

test.describe('editor block attribute useBlockProps', () => {
	test.afterEach(async ({ requestUtils }) => {
		await removeAllBlocks({ requestUtils });
	});

	test('should render block wrapper automatically', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block without useBlockProps',
			slug: 'test',
			code: 'Hello There',
			codeSingleOutput: true,
		});

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		// Editor render.
		await expect(
			editor.canvas.locator(
				'.wp-block-lazyblock-test:text("Hello There")'
			)
		).toBeVisible();

		// Publish.
		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('link', { name: 'View Post' })
			.click();

		// Frontend render.
		await expect(
			page.locator('.wp-block-lazyblock-test:text("Hello There")')
		).toBeVisible();
	});

	test('should render custom user block wrapper', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block without useBlockProps',
			slug: 'test',
			code: '<figure useBlockProps>Hello There</figure>',
			codeSingleOutput: true,
		});

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		// Editor render.
		await expect(
			editor.canvas.locator(
				'.wp-block-lazyblock-test:text("Hello There")'
			)
		).toBeVisible();

		// Publish.
		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('link', { name: 'View Post' })
			.click();

		// Frontend render.
		await expect(
			page.locator('.wp-block-lazyblock-test:text("Hello There")')
		).toBeVisible();
	});

	test('should render custom user block wrapper with custom attributes', async ({
		editor,
		page,
		admin,
		requestUtils,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block without useBlockProps',
			slug: 'test',
			code: '<figure useBlockProps class="test-custom-class" data-test="hello" style="background-color: red; color: blue;">Hello There</figure>',
			codeSingleOutput: true,
		});

		const expectSelector =
			'figure.wp-block-lazyblock-test.test-custom-class[data-test="hello"][style="background-color: red; color: blue;"]:text("Hello There")';

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		// Editor render.
		await expect(editor.canvas.locator(expectSelector)).toBeVisible();

		// Publish.
		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('link', { name: 'View Post' })
			.click();

		// Frontend render.
		await expect(page.locator(expectSelector)).toBeVisible();
	});
});
