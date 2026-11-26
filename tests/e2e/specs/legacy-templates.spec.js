import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { createNewPost } from '../utils/create-new-post';

test('keeps existing templates editable and hides admin creation', async ({
	admin,
	editor,
	page,
	requestUtils,
}) => {
	const path = '/wp/v2/lazyblocks_templates';
	const title = 'Legacy page starter';
	const template = await requestUtils.rest({
		path,
		method: 'POST',
		data: {
			title,
			status: 'publish',
			content:
				'<!-- wp:paragraph --><p>Saved starter</p><!-- /wp:paragraph -->',
			meta: {
				_lzb_template_post_types: ['page'],
				_lzb_template_lock: 'all',
				_lzb_template_blocks: encodeURIComponent(
					JSON.stringify([
						['core/paragraph', { content: 'Saved starter' }],
					])
				),
			},
		},
	});

	try {
		await admin.visitAdminPage(
			'edit.php',
			'post_type=lazyblocks_templates'
		);
		await expect(
			page.getByRole('link', { name: title, exact: true })
		).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Add New Template' })
		).toHaveCount(0);
		await expect(
			page.locator(
				'a[href*="post-new.php?post_type=lazyblocks_templates"]'
			)
		).toHaveCount(0);
		await expect(
			page.getByText('Lazy Blocks post templates are deprecated.', {
				exact: false,
			})
		).toBeVisible();

		const response = await page.goto(
			'/wp-admin/post-new.php?post_type=lazyblocks_templates'
		);
		expect(response.status()).toBe(403);

		await admin.visitAdminPage(
			'post.php',
			`post=${template.id}&action=edit`
		);
		await expect(editor.canvas.getByText('Saved starter')).toBeEditable();

		await createNewPost({ admin, page, postType: 'page' });
		await expect(editor.canvas.getByText('Saved starter')).toBeVisible();
		await expect
			.poll(() =>
				page.evaluate(() =>
					window.wp.data.select('core/block-editor').getTemplateLock()
				)
			)
			.toBe('all');
	} finally {
		await requestUtils.rest({
			path: `${path}/${template.id}`,
			method: 'DELETE',
			params: { force: true },
		});
	}
});
