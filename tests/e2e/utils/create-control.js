import { expect } from '@wordpress/e2e-test-utils-playwright';

export async function createControl({
	editor,
	page,
	type,
	label,
	options,
	checked,
	placement = 'inspector',
	isChild = false,
}) {
	// Open the type picker. An empty list shows "Browse all" instead of the
	// "Add control" button.
	if (isChild) {
		await editor.canvas
			.getByRole('button', { name: 'Add child control' })
			.first()
			.click();
	} else {
		await editor.canvas
			.getByRole('button', { name: /^(Add control|Browse all)$/ })
			.first()
			.click();
	}

	// Pick the type. The new control is selected with its label focused.
	await page
		.getByRole('searchbox', { name: 'Search control types' })
		.fill(type);
	await page.getByRole('button', { name: type, exact: true }).click();

	// Set label.
	await expect(page.locator('#lazyblocks-settings-row-label')).toBeFocused();
	await page.locator('#lazyblocks-settings-row-label').fill(label);

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

	// Set placement
	if (placement === 'content') {
		await page.getByRole('radio', { name: 'Content', exact: true }).click();
	} else if (placement === 'both') {
		await page.getByRole('radio', { name: 'Both', exact: true }).click();
	}
}
