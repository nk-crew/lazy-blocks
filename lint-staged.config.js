// eslint-disable-next-line import/no-extraneous-dependencies
const micromatch = require('micromatch');

function excludeVendor(lint) {
  return (filenames) => {
    const files = micromatch(filenames, ['!**/vendor/**/*', '!**/dist/**/*']);

    if (files && files.length) {
      return `${lint} ${files.join(' ')}`;
    }

    return [];
  };
}

module.exports = {
  '**/*.php': excludeVendor('composer run-script phpcs'),
  '**/*.css': excludeVendor('stylelint'),
  '**/*.scss': excludeVendor('stylelint --custom-syntax postcss-scss'),
  '**/*.{js,jsx}': excludeVendor('eslint'),
};
