# AGENTS.md - LLM Guide for Lazy Blocks

## Project Overview

**Lazy Blocks** is a WordPress plugin that allows users to create custom blocks for the Gutenberg editor without writing React/JavaScript code. Users define blocks visually in the WordPress admin, and the plugin handles the block registration and rendering.

- **Website**: https://www.lazyblocks.com/
- **Documentation**: https://www.lazyblocks.com/docs/overview/
- **WordPress Plugin**: https://wordpress.org/plugins/lazy-blocks/
- **License**: GPL-2.0-or-later

### Core Concept

1. **Configure Block** - Set block name, icon, category, and settings
2. **Add Controls** - Add input fields (text, image, gallery, repeaters, etc.)
3. **Write Output** - Define block output using PHP templates or Handlebars

## Tech Stack

- **PHP**: >= 8.0 (8.3+ recommended) - Backend logic, block registration, rendering
- **JavaScript/React**: Block editor UI components using `@wordpress/scripts`
- **SCSS**: Styling with WordPress-style conventions
- **Build Tools**: Webpack via `@wordpress/scripts`, Gulp for tasks
- **Testing**: Playwright (E2E), PHPUnit (unit tests)
- **Code Quality**: ESLint, Stylelint, PHP CodeSniffer (WPCS)

## Project Structure

```
lazy-blocks/
├── lazy-blocks.php          # Main plugin file, LazyBlocks singleton class
├── index.php                 # Security file
├── classes/                  # PHP classes
│   ├── class-blocks.php      # Block registration and CPT management
│   ├── class-controls.php    # Controls management
│   ├── class-assets.php      # Asset enqueueing
│   ├── class-admin.php       # Admin UI
│   ├── class-rest.php        # REST API endpoints
│   ├── class-handlebars.php  # Handlebars template engine
│   ├── class-templates.php   # Template management (deprecated)
│   ├── class-tools.php       # Import/Export tools
│   ├── class-icons.php       # Icon management
│   └── 3rd/                  # Third-party integrations
├── controls/                 # Control types
│   ├── _base/                # Base control class (LazyBlocks_Control)
│   │   ├── index.php         # PHP control logic
│   │   └── script.js         # JS control component (optional)
│   ├── text/
│   ├── textarea/
│   ├── image/
│   ├── gallery/
│   ├── repeater/
│   ├── select/
│   ├── url/
│   └── ...                   # ~22 control types total
├── assets/                   # Frontend assets (JS/SCSS)
│   ├── editor/               # Block editor integration
│   ├── block-builder/        # Block builder UI
│   ├── components/           # Reusable React components
│   ├── hooks/                # React hooks
│   ├── admin/                # Admin pages
│   └── utils/                # Utility functions
├── build/                    # Compiled assets (generated)
├── tests/
│   ├── e2e/                  # Playwright E2E tests
│   └── phpunit/              # PHPUnit tests
└── languages/                # Translations
```

## Key Concepts

### Block Registration

Blocks are stored as a Custom Post Type (`lazyblocks`) and registered dynamically. The main class is `LazyBlocks_Blocks` in `classes/class-blocks.php`.

**PHP API for programmatic block registration:**
```php
lazyblocks()->add_block( array(
    'slug'     => 'my-block',
    'title'    => 'My Block',
    'icon'     => '<svg>...</svg>',
    'controls' => array(
        array(
            'type'  => 'text',
            'name'  => 'my_text',
            'label' => 'Text Field',
        ),
    ),
    'code'     => array(
        'output_method' => 'php',
        'single_output' => true,
        'frontend_html' => '<div><?php echo esc_html( $attributes["my_text"] ); ?></div>',
    ),
) );
```

### Controls System

Controls are input fields for block attributes. Each control:
- Extends `LazyBlocks_Control` base class (`controls/_base/index.php`)
- Has PHP backend (`index.php`) and optional JS frontend (`script.js`)
- Registers via `lzb/controls/all` filter

**Control categories:** basic, content, choice, advanced, layout

**Available controls:** text, textarea, number, range, url, email, password, image, gallery, file, rich_text, classic_editor, code_editor, inner_blocks, checkbox, toggle, radio, select, color, date_time, repeater

### Block Output

Blocks can output content using:
1. **PHP** - Most common, uses `$attributes` array
2. **Handlebars** - Simple templating with `{{attribute_name}}`
3. **Theme Templates** - Place templates in theme's `lazy-blocks-templates/` folder

### Important Hooks (Filters/Actions)

**PHP Filters:**
- `lzb/controls/all` - Register/modify controls
- `lzb/control_value` - Filter control values during render
- `lzb/block_render/output` - Modify block output
- `lzb/prepare_block_attribute` - Modify attribute before save
- `lzb/register_block_type_data` - Override block registration data
- `lzb/get_blocks` - Filter all registered blocks

**PHP Actions:**
- `lzb/init` - Plugin initialization, register custom controls here

**JS Filters:**
- `lzb.registerBlockType.args` - Modify block registration arguments

## Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Production build (creates zip)
npm run build:prod

# Linting
npm run lint:js       # ESLint
npm run lint:css      # Stylelint
npm run lint:php      # PHP CodeSniffer (requires wp-env)

# Formatting
npm run format:js
npm run format:css
npm run format:php

# Testing (requires Docker)
npm run env:start     # Start WordPress environment
npm run test:e2e      # Playwright E2E tests
npm run test:unit:php # PHPUnit tests
```

## Creating a New Control

1. Create folder in `controls/` (e.g., `controls/my_control/`)
2. Add `index.php` extending `LazyBlocks_Control`:

```php
<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class LazyBlocks_Control_My_Control extends LazyBlocks_Control {
    public function __construct() {
        $this->name     = 'my_control';
        $this->icon     = '<svg>...</svg>';
        $this->type     = 'string';  // string, number, boolean, array
        $this->label    = __( 'My Control', 'lazy-blocks' );
        $this->category = 'basic';
        
        parent::__construct();
    }
}
new LazyBlocks_Control_My_Control();
```

3. Add `script.js` for editor UI (React component):

```javascript
import { addFilter } from '@wordpress/hooks';
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

function ComponentRender(props) {
    const baseControlProps = useBlockControlProps(props);
    
    return (
        <BaseControl {...baseControlProps}>
            {/* Your control UI */}
        </BaseControl>
    );
}

addFilter('lzb.editor.control.my_control.render', 'lzb.editor', (render, props) => (
    <ComponentRender {...props} />
));
```

4. Webpack automatically picks up `controls/*/script.js` files

## Key Files to Understand

| File | Purpose |
|------|---------|
| `lazy-blocks.php` | Main plugin class, singleton pattern |
| `classes/class-blocks.php` | Block CPT, registration, rendering |
| `classes/class-controls.php` | Control management, includes all controls |
| `controls/_base/index.php` | Base control class, extend for new controls |
| `assets/editor/index.js` | Block editor integration |
| `assets/block-builder/index.js` | Block builder UI |
| `assets/components/` | Reusable React components |
| `webpack.config.js` | Build configuration |

## Code Style Guidelines

- **PHP**: WordPress Coding Standards (WPCS)
- **JavaScript**: WordPress ESLint config
- **CSS/SCSS**: WordPress Stylelint config

Always run linters before committing. Pre-commit hooks are configured via Husky.

## Testing

- **E2E Tests**: `tests/e2e/specs/` - Playwright tests for full user flows
- **Unit Tests**: `tests/phpunit/` - PHP unit tests
- **Test Environment**: Uses `@wordpress/env` (Docker-based WordPress)

## Common Tasks

### Adding a Block Setting

1. Update block data structure in `classes/class-blocks.php`
2. Add UI in `assets/block-builder/` React components
3. Handle in block registration/rendering logic

### Modifying Control Behavior

1. Find control in `controls/{control_name}/`
2. PHP logic in `index.php`, JS UI in `script.js`
3. Use appropriate filters (`lzb/control_value`, etc.)

### Adding REST Endpoint

1. Add endpoint in `classes/class-rest.php`
2. Follow WordPress REST API patterns

## Pro Version

The Pro version extends the free plugin with:
- Conditional logic for controls
- Block styles and scripts
- Posts/Users/Taxonomy controls
- Additional features

Pro-specific code uses `lazyblocks()->is_pro()` checks.

## Resources

- [Documentation](https://www.lazyblocks.com/docs/overview/)
- [Block Controls](https://www.lazyblocks.com/docs/blocks-controls/)
- [PHP API](https://www.lazyblocks.com/docs/examples/create-custom-control/)
- [GitHub Issues](https://github.com/nk-crew/lazy-blocks/issues)
