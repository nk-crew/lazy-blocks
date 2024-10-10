module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	rules: {
		'@wordpress/no-unsafe-wp-apis': 0,
	},
	settings: {
		'import/core-modules': ['jquery'],
	},
};
