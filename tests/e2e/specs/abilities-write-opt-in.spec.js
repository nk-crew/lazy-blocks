/**
 * WordPress dependencies
 */
import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { createNewPost } from '../utils/create-new-post';
import { removeAllBlocks } from '../utils/remove-all-blocks';

const OPTION_LABEL = 'Allow AI agents to create and edit blocks';

async function setWriteAbilities({ admin, page }, enabled) {
	await admin.visitAdminPage(
		'edit.php',
		'post_type=lazyblocks&page=lazyblocks_settings'
	);
	await page.getByLabel(OPTION_LABEL).setChecked(enabled);
	await page.getByRole('button', { name: 'Save Changes' }).click();
	await expect(page.getByText('Settings saved.')).toBeVisible();
}

function runCreateBlock(requestUtils, input) {
	return requestUtils.rest({
		method: 'POST',
		path: '/wp-abilities/v1/abilities/lazy-blocks/create-block/run',
		data: { input },
	});
}

test.describe('abilities write opt-in', () => {
	test.afterEach(async ({ admin, page, requestUtils }) => {
		await setWriteAbilities({ admin, page }, false);
		await removeAllBlocks({ requestUtils });
	});

	test('should create a block through the ability only after the option is turned on', async ({
		admin,
		page,
		editor,
		context,
		requestUtils,
	}) => {
		const input = {
			title: 'Agent Block',
			data: {
				slug: 'agent-block',
				code_single_output: true,
				code_frontend_html: '<p useBlockProps>Made by an agent</p>',
			},
		};

		await setWriteAbilities({ admin, page }, false);
		await expect(runCreateBlock(requestUtils, input)).rejects.toMatchObject(
			{ code: 'rest_ability_not_found' }
		);

		await setWriteAbilities({ admin, page }, true);
		await expect(page.getByLabel(OPTION_LABEL)).toBeChecked();

		const created = await runCreateBlock(requestUtils, input);
		expect(created.data.slug).toBe('agent-block');

		await admin.visitAdminPage('edit.php', 'post_type=lazyblocks');
		await expect(
			page.getByRole('row', { name: /Agent Block/ })
		).toContainText('Created by AI agent');

		await createNewPost({ admin, page });

		await page
			.getByRole('button', {
				name: /^(Block Inserter|Toggle block inserter)$/,
			})
			.click();
		await page
			.getByRole('searchbox', { name: /^Search/ })
			.fill('Agent Block');
		await page.getByRole('option', { name: 'Agent Block' }).click();

		await expect(
			editor.canvas.locator('text="Made by an agent"')
		).toBeVisible();

		await page
			.getByRole('button', { name: 'Publish', exact: true })
			.click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		const [frontendPage] = await Promise.all([
			context.waitForEvent('page'),
			page
				.getByLabel('Editor publish')
				.getByRole('link', { name: 'View Post' })
				.click(),
		]);

		await frontendPage.waitForLoadState('domcontentloaded');

		await expect(
			frontendPage.locator(
				'.wp-block-lazyblock-agent-block:text("Made by an agent")'
			)
		).toBeVisible();
	});
});
