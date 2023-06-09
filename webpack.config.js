/**
 * External Dependencies
 */
const { resolve } = require('path');

const glob = require('glob');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const RtlCssPlugin = require('rtlcss-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

// Prepare JS for controls.
const entryControls = glob
	.sync('./controls/**/script.js')
	.reduce(function (entries, entry) {
		const matchForRename = /controls\/([\w\d_]+)\/script\.js$/g.exec(entry);

		if (
			matchForRename !== null &&
			typeof matchForRename[1] !== 'undefined'
		) {
			entries[`control-${matchForRename[1].replace('_', '-')}`] = resolve(
				process.cwd(),
				entry
			);
		}

		return entries;
	}, {});

const newConfig = {
	...defaultConfig,
	...{
		entry: {
			// JS.
			'admin-templates': resolve(
				process.cwd(),
				'assets/admin/templates',
				'index.js'
			),
			'admin-tools': resolve(
				process.cwd(),
				'assets/admin/tools',
				'index.js'
			),
			editor: resolve(process.cwd(), 'assets/editor', 'index.js'),
			'editor-translation': resolve(
				process.cwd(),
				'assets/editor',
				'translation.js'
			),
			'editor-constructor': resolve(
				process.cwd(),
				'assets/editor-constructor',
				'index.js'
			),

			// JS controls.
			...entryControls,

			// SCSS.
			'admin-style': resolve(process.cwd(), 'assets/admin', 'index.scss'),
			'editor-constructor-astra-style': resolve(
				process.cwd(),
				'assets/editor-constructor/3rd',
				'astra.scss'
			),
		},

		// Display minimum info in terminal.
		stats: 'minimal',
	},
	plugins: [
		...defaultConfig.plugins,
		new RtlCssPlugin({
			filename: `[name]-rtl.css`,
		}),
	],
};

// Production only.
if (isProduction) {
	// Remove JS files created for styles
	// to prevent enqueue it on production.
	newConfig.plugins = [new RemoveEmptyScriptsPlugin(), ...newConfig.plugins];
}

// Development only.
if (!isProduction) {
	newConfig.devServer = {
		...newConfig.devServer,
		// Support for dev server on all domains.
		allowedHosts: 'all',
	};

	// Fix HMR is not working with multiple entries.
	// @thanks https://github.com/webpack/webpack-dev-server/issues/2792#issuecomment-806983882
	newConfig.optimization.runtimeChunk = 'single';
}

module.exports = newConfig;
