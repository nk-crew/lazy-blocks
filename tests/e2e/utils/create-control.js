export async function createControl({
	editor,
	page,
	type,
	label,
	options,
	checked,
	isChild = false,
}) {
	// Create and select control.
	if (isChild) {
		await editor.canvas
			.locator('.lzb-block-builder-controls-item-appender')
			.first()
			.click();
	} else {
		await editor.canvas.getByLabel('Add Control').click();
	}

	await editor.canvas.getByText('(no label)').click();

	// Select type.
	await page.getByLabel('Type').click();

	await page.getByPlaceholder('Type to Search…').fill(type);

	await page.getByRole('button', { name: type, exact: true }).click();

	// Set label
	await page.getByPlaceholder('(no label)').fill(label);

	// Set options
	if (options && Array.isArray(options)) {
		for (let i = 0; i < options.length; i++) {
			await page.getByRole('button', { name: '+ Add Choice' }).click();

			await page
				.getByPlaceholder('Label')
				.nth(i + 1)
				.fill(options[i].label);
			await page.getByPlaceholder('Value').nth(i).fill(options[i].value);
		}
	}

	// Set checked
	if (checked) {
		await page.locator('#lazyblocks-control-checkbox-checked').check();
	}
}
