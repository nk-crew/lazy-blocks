/**
 * External dependencies
 */

import { fileURLToPath } from 'node:url';
import { createPlaywrightConfig } from '@nk-crew/plugin-toolkit/playwright';
import { defineConfig } from '@playwright/test';

const config = defineConfig(
	createPlaywrightConfig({
		testDir: fileURLToPath(new URL('./specs', `file:${__filename}`).href),
		globalSetup: fileURLToPath(
			new URL('./config/global-setup.js', `file:${__filename}`).href
		),
		timeout: 100_000,
		reporters: ['./config/flaky-tests-reporter.js'],
	})
);

export default config;
