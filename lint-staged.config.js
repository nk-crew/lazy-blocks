// eslint-disable-next-line import/no-extraneous-dependencies
const micromatch = require('micromatch');

function excludeVendor(lint) {
	return (filenames) => {
		const files = micromatch(filenames, [
			'!**/.*',
			'!**/vendor/**/*',
			'!**/build/**/*',
			'!**/dist/**/*',
		]);

		if (files && files.length) {
			return `${lint} ${files.join(' ')}`;
		}

		return [];
	};
}

module.exports = {
	'**/*.php': excludeVendor('composer run-script lint'),
	'**/*.{css,scss}': excludeVendor('wp-scripts lint-style'),
	'**/*.{js,jsx}': excludeVendor('wp-scripts lint-js'),
};
