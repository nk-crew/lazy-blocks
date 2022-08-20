# Lazy Blocks - Gutenberg blocks visual constructor

- Site <https://lazyblocks.com/>
- WordPress Plugin <https://wordpress.org/plugins/lazy-blocks/>

## Development

### Requirements

| Prerequisite              | How to check  | How to install                                  |
| ------------------------- | ------------- | ----------------------------------------------- |
| PHP >= 5.5.9              | `php -v`      | [php.net](https://php.net/manual/en/install.php) |
| Node.js >= 6.x.x          | `node -v`     | [nodejs.org](https://nodejs.org/)                |
| Composer >= 1.0.0         | `composer -V` | [getcomposer.org](https://getcomposer.org)       |

### Installation

- Run `npm install` in the command line. Or if you need to update some dependencies, run `npm update`

### Building

- `npm run dev` to run build and start files watcher
- `npm run build` to run build
- `npm run build:prod` to run build and prepare zip files for production

### Linting

We use `pre-commit` and `pre-push` hooks for Git to lint sources with `phpcs`, `eslint` and `stylelint` tasks.

NPM commands to work with linting:

- `npm run php-lint` to show `phpcs` errors
- `npm run php-lint-fix` to automatically fix some of the `phpcs` errors
- `npm run js-lint` to show `eslint` errors
- `npm run js-lint-fix` to automatically fix some of the `eslint` errors
- `npm run css-lint` to show `stylelint` errors
- `npm run css-lint-fix` to automatically fix some of the `stylelint` errors

All linters compatible with the modern IDE and code editors.
