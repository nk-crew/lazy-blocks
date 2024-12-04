<h1 align="center">
  <a href="https://www.lazyblocks.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://www.lazyblocks.com/logo-white.svg">
      <img src="https://www.lazyblocks.com/logo.svg" height="40" alt="Lazy Blocks - Custom Blocks Builder">
    </picture>
  </a>
</h1>

<p align="center">
  <a href="https://wordpress.org/plugins/lazy-blocks/"><img alt="WordPress Plugin Version" src="https://img.shields.io/wordpress/plugin/v/lazy-blocks"></a>
  <a href="https://wordpress.org/plugins/lazy-blocks/"><img alt="WordPress Plugin Rating" src="https://img.shields.io/wordpress/plugin/rating/lazy-blocks"></a>
  <a href="https://wordpress.org/plugins/lazy-blocks/"><img alt="WordPress Plugin Downloads" src="https://img.shields.io/wordpress/plugin/dt/lazy-blocks"></a>
  <a href="https://github.com/nk-crew/lazy-blocks/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/nk-crew/lazy-blocks"></a>
</p>

<p align="center">Build custom blocks for WordPress block editor (Gutenberg) without coding.</p>

<p align="center">
  <a href="https://www.lazyblocks.com/">Website</a> &nbsp; <a href="https://www.lazyblocks.com/docs/overview/">Documentation</a> &nbsp; <a href="https://wordpress.org/plugins/lazy-blocks/">WordPress Plugin</a> &nbsp; <a href="https://www.lazyblocks.com/pro/">Pro Version</a>
</p>

## Overview

Lazy Blocks is a WordPress plugin that helps you create custom blocks for the Gutenberg editor without coding. Key features:

- 📝 Visual block builder with drag & drop interface
- 🎛️ Rich set of controls (Text, Image, Gallery, etc.)
- 🔄 Output blocks with PHP, HTML, or theme templates
- ⚡ Extensive filters and actions for developers

## Development

### Prerequisites

- PHP >= 7.2
- Node.js >= 18.0
- Composer >= 2.0

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

```bash
# Start development with file watcher
npm run dev

# Build for development
npm run build

# Build for production (with zip file)
npm run build:prod
```

### Code Quality

We use automated tools to ensure code quality. Pre-commit and pre-push hooks are configured for:
- PHP CodeSniffer
- ESLint
- Stylelint

```bash
# Linting
npm run lint:php    # Check PHP code
npm run lint:js     # Check JavaScript code
npm run lint:css    # Check CSS code

# Auto-fixing
npm run format:php  # Fix PHP code
npm run format:js   # Fix JavaScript code
npm run format:css  # Fix CSS code
```

### Testing

We use WordPress's official testing environment powered by Docker and wp-env.

1. [Install Docker](https://www.docker.com/) on your machine
2. Start the server:
   ```bash
   npm run env:start
   ```
3. Run tests:
   ```bash
   # End-to-end tests (Playwright)
   npm run test:e2e

   # PHP Unit tests
   npm run test:unit:php
   ```

## License

This project is licensed under the GPL-2.0-or-later License - see the [LICENSE](LICENSE.txt) file for details.
