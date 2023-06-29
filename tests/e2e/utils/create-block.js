export async function createBlock({
	requestUtils,
	title,
	slug,
	description,
	code,
	codeSingleOutput,
}) {
	const block = await requestUtils.rest({
		path: '/wp/v2/lazyblocks',
		method: 'POST',
		data: {
			status: 'publish',
			slug,
			title,
		},
	});

	const blockID =
		typeof block.id !== 'undefined' ? parseInt(block.id, 10) : null;

	// Add meta.
	await requestUtils.rest({
		path: '/lazy-blocks/v1/update-block-data',
		method: 'POST',
		data: {
			post_id: blockID,
			data: {
				slug,
				description: description || '',
				code_single_output: codeSingleOutput ? 'true' : 'false',
				code_frontend_html: code || '',
			},
		},
	});

	return blockID;
}
