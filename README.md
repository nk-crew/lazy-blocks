# Lazy Blocks - block builder for WordPress Gutenberg

- Site <https://www.lazyblocks.com/>
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

- `npm run lint:php` to show `phpcs` errors
- `npm run format:php` to automatically fix some of the `phpcs` errors
- `npm run lint:js` to show `eslint` errors
- `npm run format:js` to automatically fix some of the `eslint` errors
- `npm run lint:css` to show `stylelint` errors
- `npm run format:css` to automatically fix some of the `stylelint` errors

All linters compatible with the modern IDE and code editors.

### Testing

We are using the testing solution provided by the Gutenberg team. To get started you need to [install Docker](https://www.docker.com/). And that's it... All other work will made by `wp-env` package.

NPM commands to work with testing:

- `npm run test:e2e` to run end to end tests in the headless browser using Playwright
- `npm run test:unit:php` tp run PHPUnit tests
