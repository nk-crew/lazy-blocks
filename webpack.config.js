/**
 * External Dependencies
 */
const { resolve } = require('node:path');

const glob = require('glob');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const RtlCssPlugin = require('rtlcss-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

// Prepare JS for controls.
const entryControls = glob
	.sync('./controls/**/script.js')
	.reduce((entries, entry) => {
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
			'block-builder': resolve(
				process.cwd(),
				'assets/block-builder',
				'index.js'
			),

			// JS controls.
			...entryControls,

			// SCSS.
			'admin-style': resolve(process.cwd(), 'assets/admin', 'index.scss'),
			'block-builder-astra-style': resolve(
				process.cwd(),
				'assets/block-builder/3rd',
				'astra.scss'
			),
		},

		// Display minimum info in terminal.
		stats: 'minimal',

		optimization: {
			...defaultConfig.optimization,
			splitChunks: {
				...defaultConfig.optimization.splitChunks,
				cacheGroups: {
					...defaultConfig.optimization.splitChunks.cacheGroups,
					// All control scripts load together in the editor, so libraries
					// several of them use (dnd-kit, array-move, classnames) ship once in this chunk.
					// PHP adds it as a dependency of every control script.
					controlsVendor: {
						name: 'controls-vendor',
						// JS only: styles stay in each control's own CSS file.
						test: (module) =>
							module.type.startsWith('javascript') &&
							/[\\/]node_modules[\\/]/.test(
								module.resource || ''
							),
						chunks: (chunk) => /^control-/.test(chunk.name),
						minChunks: 2,
						enforce: true,
					},
				},
			},
		},
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
