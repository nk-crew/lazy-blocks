# Lazy Blocks - Gutenberg Blocks Constructor #
* Contributors: nko
* Tags: gutenberg, blocks, custom, meta, fields
* Requires at least: 4.9.0
* Tested up to: 5.0
* Requires PHP: 5.4
* Stable tag: @@plugin_version
* License: GPLv2 or later
* License URI: http://www.gnu.org/licenses/gpl-2.0.html

Gutenberg blocks visual constructor. Custom meta fields or blocks with output without hard coding.

## Description ##

**Lazy Blocks** is a Gutenberg blocks visual constructor for WordPress developers. You can create custom **meta fields** as well as **blocks** with output HTML. Add editor controls to your blocks using **drag & drop** visual constructor. Create **post templates** with predefined blocks (any post type).

#### Links ####

* [Site](https://lazyblocks.com/)
* [Documentation](https://lazyblocks.com/documentation/getting-started/)
* [GitHub](https://github.com/nk-o/lazy-blocks)

#### Features ####

* Create blocks with output code
* Create blocks for meta custom fields
* Handlebars used for blocks output
* Export to PHP
* Show controls in block content / inspector
* Controls available:
    * Repeater
    * Text
    * Textarea
    * Number
    * Range
    * URL
    * Email
    * Password
    * Image
    * Gallery
    * Rich Text (WYSIWYG)
    * Code Editor
    * Inner Blocks
    * Select
    * Checkbox
    * Toggle
    * Color Picker
    * Date Time

## Installation ##

Make sure you use WordPress 5.0.x. As alternative you need to install the [Gutenberg plugin](https://wordpress.org/plugins/gutenberg/) to use Lazy Blocks.

#### Automatic installation ####

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of LazyBlocks, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type LazyBlocks and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

#### Manual installation ####

The manual installation method involves downloading our LazyBlocks plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

## Screenshots ##

1. Blocks constructor
2. Posts templates
3. Block in Gutenberg editor

## Changelog ##

= 1.4.1 =

* added action to add Handlebars custom helpers (info in documentation)
* added filter to disable frontend block wrapper of the block (info in documentation)
* improved columns in admin list of lazy blocks
* extended list of symbols that need to be removed from the block slug
* fixed PHP output for frontend if HTML output is empty
* fixed losing Frontend & Editor output data when added output PHP filters

= 1.4.0 =

* added support for blocks PHP preview rendering in Editor
* added toggle button in Repeater control to toggle all rows
* added block slug validation and automatic creation in constructor
* added descriptions to additional block fields in constructor
* added new attribute `blockUniqueClass` that will adds automatically on each Lazy block
* added title on Image and Gallery attributes object
* changed Editor rendering to AJAX also for Handlebars templates
* changed output for lazy blocks - always added wrapper with block class

= 1.3.2 =

* added unique `blockUniqueClass` attribute to each lazy block attributes and in editor wrapper

= 1.3.1 =

* added unique `blockId` attribute to each lazy block
* simplified enqueue in admin templates page
* fixed do_shortcode wrong attributes output (reserved `data` and `hash` attributes)
* fixed Range control saving value

= 1.3.0 =

* added filter for output frontend PHP of blocks ([read in documentation](https://lazyblocks.com/documentation/blocks-code/php/))
* added Allow Null option to Select control
* added Help option in controls
* added Placeholder option in controls
* added all existing categories in block categories selector
* fixed gallery control editable images
* fixed dropzone position in image and gallery controls
* fixed custom category title changing to slug
* fixed automatic fill of control name in constructor
* fixed date control error in WP 5.0
* minor changes

= 1.2.2 =

* fixed templates loading in Gutenberg 4.5
* fixed do_shortcode work with Image control value

= 1.2.1 =

* fixed controls errors in Gutenberg 4.2.0 (Gallery, Image, Code Editor)

= 1.2.0 =

* added Inner Blocks control
* added support for custom frontend render function (use PHP instead of Handlebars) [https://lazyblocks.com/documentation/blocks-code/php/](https://lazyblocks.com/documentation/blocks-code/php/)
* added possibility to resort Repeater rows
* changed Repeater control styles
* disabled autofocus in URL control
* fixed URL input width
* fixed Number control value save

= 1.1.1 =

* added RichText control

= 1.1.0 =

* added possibility to use all registered blocks in posts templates
* added selector with search and block icons to easily find and add blocks to templates
* added Free Content block to use in templates when template locked
* added + button inside Repeater block
* added Range control
* added Color Picker control
* added Date Time Picker control
* added Documentation link in admin menu
* improved URL control to search for available posts in blog

= 1.0.4 =

* fixed catchable fatal error when use do_shortcode Handlebars helper

= 1.0.3 =

* added support for custom categories [https://wordpress.org/support/topic/frontend-html/](https://wordpress.org/support/topic/frontend-html/)
* improved **do_shortcode** handlebars helper to work with attributes. Read here how to use - [https://lazyblocks.com/docs/documentation/examples/shortcode-gutenberg/](https://lazyblocks.com/docs/documentation/examples/shortcode-gutenberg/)
* fixed image field data conversion to array

= 1.0.2 =

* changed admin menu method (simplified)
* fixed capabilities bug [https://wordpress.org/support/topic/permission-error-when-accessing-plugins-admin-pages/](https://wordpress.org/support/topic/permission-error-when-accessing-plugins-admin-pages/)

= 1.0.0 =

* Initial Release
