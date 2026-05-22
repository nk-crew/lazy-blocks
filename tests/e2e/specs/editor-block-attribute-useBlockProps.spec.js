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
		context,
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

		// View Post opens in a new tab, so we need to handle it.
		const [frontendPage] = await Promise.all([
			context.waitForEvent('page'),
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
				.click(),
		]);

		await frontendPage.waitForLoadState('domcontentloaded');

		// Frontend render.
		await expect(
			frontendPage.locator('.wp-block-lazyblock-test:text("Hello There")')
		).toBeVisible();
	});

	test('should render custom user block wrapper', async ({
		editor,
		page,
		admin,
		requestUtils,
		context,
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

		// View Post opens in a new tab, so we need to handle it.
		const [frontendPage] = await Promise.all([
			context.waitForEvent('page'),
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
				.click(),
		]);

		await frontendPage.waitForLoadState('domcontentloaded');

		// Frontend render.
		await expect(
			frontendPage.locator('.wp-block-lazyblock-test:text("Hello There")')
		).toBeVisible();
	});

	test('should render custom user block wrapper with custom attributes', async ({
		editor,
		page,
		admin,
		requestUtils,
		context,
	}) => {
		await createBlock({
			requestUtils,
			title: 'Block without useBlockProps',
			slug: 'test',
			code: '<figure useBlockProps class="test-custom-class" data-test="hello" style="background-color: red; color: blue;">Hello There</figure>',
			codeSingleOutput: true,
		});

		const expectSelector =
			'figure.wp-block-lazyblock-test.test-custom-class[data-test="hello"]';

		await admin.createNewPost();

		await editor.insertBlock({
			name: 'lazyblock/test',
		});

		const editorBlock = editor.canvas
			.locator(expectSelector)
			.filter({ hasText: 'Hello There' });

		// Editor render.
		await expect(editorBlock).toBeVisible();
		await expect(editorBlock).toHaveCSS(
			'background-color',
			'rgb(255, 0, 0)'
		);
		await expect(editorBlock).toHaveCSS('color', 'rgb(0, 0, 255)');

		// Publish.
		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		// View Post opens in a new tab, so we need to handle it.
		const [frontendPage] = await Promise.all([
			context.waitForEvent('page'),
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
				.click(),
		]);

		await frontendPage.waitForLoadState('domcontentloaded');

		const frontendBlock = frontendPage
			.locator(expectSelector)
			.filter({ hasText: 'Hello There' });

		// Frontend render.
		await expect(frontendBlock).toBeVisible();
		await expect(frontendBlock).toHaveCSS(
			'background-color',
			'rgb(255, 0, 0)'
		);
		await expect(frontendBlock).toHaveCSS('color', 'rgb(0, 0, 255)');
	});
});
