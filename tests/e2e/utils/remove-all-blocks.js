export async function removeAllBlocks({ requestUtils }) {
	// List all lazyblocks posts.
	const blocks = await requestUtils.rest({
		path: '/wp/v2/lazyblocks',
		params: {
			per_page: 100,
			// All possible statuses.
			status: 'publish,future,draft,pending,private,trash',
		},
	});

	// Delete all lazyblocks one by one except the Example Block.
	// "/wp/v2/posts" not yet supports batch requests.
	await Promise.all(
		blocks.map((block) => {
			// Skip Example Block.
			if (block?.title?.rendered === 'Example Block') {
				return null;
			}

			return requestUtils.rest({
				method: 'DELETE',
				path: `/wp/v2/lazyblocks/${block.id}`,
				params: {
					force: true,
				},
			});
		})
	);
}
