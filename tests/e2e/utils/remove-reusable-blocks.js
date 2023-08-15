export async function removeReusableBlocks({ requestUtils }) {
	// List all `wp_block` posts.
	const blocks = await requestUtils.rest({
		path: '/wp/v2/blocks',
		params: {
			per_page: 100,
			// All possible statuses.
			status: 'publish,future,draft,pending,private,trash',
		},
	});

	// Delete all `wp_block` one by one.
	// "/wp/v2/posts" not yet supports batch requests.
	await Promise.all(
		blocks.map((block) => {
			return requestUtils.rest({
				method: 'DELETE',
				path: `/wp/v2/blocks/${block.id}`,
				params: {
					force: true,
				},
			});
		})
	);
}
