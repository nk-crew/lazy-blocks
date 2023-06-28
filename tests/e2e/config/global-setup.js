/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { request } from '@playwright/test';

/**
 * WordPress dependencies
 */
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

async function globalSetup(config) {
	const { storageState, baseURL } = config.projects[0].use;
	const storageStatePath =
		typeof storageState === 'string' ? storageState : undefined;

	const requestContext = await request.newContext({
		baseURL,
	});

	const requestUtils = new RequestUtils(requestContext, {
		storageStatePath,
	});

	// Authenticate and save the storageState to disk.
	await requestUtils.setupRest();

	await requestContext.dispose();
}

export default globalSetup;
