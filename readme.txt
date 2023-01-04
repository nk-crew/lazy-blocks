# Custom Blocks Constructor - Lazy Blocks

* Contributors: nko
* Tags: gutenberg, blocks, custom, meta, fields
* Donate link: https://www.lazyblocks.com/pro/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=donate
* Requires at least: 5.8
* Tested up to: 6.1
* Requires PHP: 7.2
* Stable tag: 3.3.0
* License: GPLv2 or later
* License URI: <http://www.gnu.org/licenses/gpl-2.0.html>

Easily create custom Gutenberg blocks and custom meta fields without hard coding.

## Description

**Custom Blocks Plugin For WordPress**
★★★★★<br>

**Developers magic wand for WordPress custom blocks.** We created [**Lazy Blocks WordPress plugin**](https://www.lazyblocks.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head), to help every developer get access to the powerful tools they need to quickly run websites based on WordPress block editor (called Gutenberg).

[Official Site](https://www.lazyblocks.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head) | [Documentation](https://www.lazyblocks.com/docs/overview/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head) | [GitHub](https://github.com/nk-crew/lazy-blocks)

Create custom blocks visually, add controls to your blocks using drag & drop, write blocks output using HTML or PHP code. You can create custom blocks as well as custom meta fields for specific post types. Furthermore, you are able to create post templates with predefined blocks for any post type.

### 🚀 Easy To Start

This everything you need to deploy your custom block in WordPress editor:

**1. Configure Custom Block** <br> Give a name to your custom block, set icon, category, etc.

**2. Add Controls** <br> Add control fields like simple text and complex image selectors.

**3. Write Output Code** <br> Output code for your custom block with HTML and PHP support.

### 🌟 Features

* Custom blocks with output code
* Custom blocks for posts meta fields
* Large set of predefined controls
* Show controls in block content / inspector
* Multiple output methods allowed
  * Custom PHP
  * Custom HTML + Handlebars
  * Template files in theme folder
* Export / Import blocks

### 🔥 Controls

To manage custom blocks attributes you need to use Controls. Lazy Blocks have a large set of controls predefined for you:

* Basic
  * Text
  * Textarea
  * Number
  * Range
  * URL
  * Email
  * Password
* Content
  * Image
  * Gallery
  * File
  * Rich Text
  * Classic Editor
  * Code Editor
  * Inner Blocks
* Choice
  * Select
  * Radio
  * Checkbox
  * Toggle
* Advanced
  * Color Picker
  * Date Time Picker
* Layout
  * Repeater
* Custom Controls [read our extensive documentation](https://www.lazyblocks.com/docs/examples/create-custom-control/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=custom_controls)

### 🏳️ Multilingual

Lazy Blocks adds a new layer of compatibility for [WPML](https://wpml.org/). All text controls of custom blocks are compatible with WPML and ready for translation. [https://www.lazyblocks.com/docs/multilingual/](https://www.lazyblocks.com/docs/multilingual/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=wpml)

### 🛠 Built For Developers

Lazy Blocks built by developers, for developers and gives you unlimited freedom to create custom blocks. Furthermore, there are PHP filters and actions to customize every part of your custom blocks from the backend. Possibility to use PHP and theme templates system.

Every UI part should be intuitive for simple custom blocks, but if you want to create something more complex, you may be required to [read our extensive documentation](https://www.lazyblocks.com/docs/overview/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=developers).

### 🔥 Lazy Blocks Pro

> The Lazy Blocks plugin is also available in a professional version which includes more controls and features! [**Learn more about Lazy Blocks Pro**](https://www.lazyblocks.com/pro/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=pro)
>
> In order to maintain the free version of the plugin on an ongoing basis, and to provide quick and effective support for free, we offer a Pro version of the plugin. The Pro version allows you to:

* **Additional Controls**

  * **Posts** - Search and select posts based on post type or taxonomy
  * **Taxonomy** - Search and select categories, tags and any other custom taxonomies
  * **Users** - Search and select users based on user roles
  * **Units** - Advanced number input with possibility to select any CSS unit
  * **Message** - Display a helpful message between controls
  * **Code Editor** - Insert code parts using editor with syntax highlighting

* **Controls Conditions**
Conditionally display/hide controls. In order not to overload your block with a huge list of controls, you can hide some of them depending on the values of other controls.

* **Panels and Dividers**
The Panels and Dividers provides a way to structure controls into groups. It assists in better organizing the block panel UI.

* **Blocks Preloading**
Display blocks preview immediately once the page editor loaded.

* **SEO Enhancements**
Additional support for content analysis in Rank Math and Yoast SEO plugins.

[**Find much more custom blocks features of Lazy Blocks Pro today!**](https://www.lazyblocks.com/pro/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=pro)

## Installation

### Automatic installation

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of Lazy Blocks, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type “Lazy Blocks” and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

### Manual installation

The manual installation method involves downloading our Lazy Blocks plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

## Screenshots

1. Blocks Constructor
2. Custom Blocks with Example Controls
3. Posts Templates

## Changelog

= 3.3.0 =

PRO plugin:

* added support for Repeater control in the Conditional Logic

FREE plugin:

* added notice for invalid control name when creating block
* fixed Preview component JS actions call after fetch complete
* fixed displaying Date and Time pickers
* fixed Date Time Picker displaying date in the toggle label

= 3.2.1 =

PRO plugin:

* fixed block preloading inner-blocks attribute
* fixed displaying controls in columns

FREE plugin:

* added support for WPML
* added "Edit Block" link inside the block description
* fixed incorrect detection of the selected block to hide/show controls and preview
* fixed displaying control label with Required mark
* fixed margin between control and help text
* fixed block render error when add "Hide If Not Selected" option to Inner Blocks control
* fixed error "Render callback is not specified" when preview block with empty output code
* fixed export block PHP closing function call
* fixed JS error when change value of new control inside existing repeater
* fixed Classic Editor and Repeater save attribute conflict
* fixed debounce preview is not always reloaded after changes
* fixed usage of deprecated action "lzb_handlebars_object"
* fixed deprecated warning even if no deprecated hook used

= 3.1.0 =

PRO plugin:

* added block preloading feature - all blocks loaded immediately, when you open the page editor
* added support for content analysis in Rank Math and Yoast
* added setting to remove block frame in page editor and display it as native block
* added Link Suggestions option to URL control (select post types to suggest links when typing)
* added Rich Preview option to URL control (display page title and image of selected URL)

FREE plugin:

* added support for Blocks API v2
* added `lzb/init` hook for developers to register blocks in PHP
* added autoFocus to constructor control Type popup input search
* added autoFocus to choices component when adding new choice
* added JS filters - `lzb.components.PreviewServerCallback.allowFetch`, `lzb.constructor.code-settings.output-method`, `lzb.constructor.code-settings.output-code`, `lzb.constructor.code-settings.output-template`, `lzb.constructor.code-settings.preview`, `lzb.constructor.code-settings.additional`
* added PHP filters - `lzb/block_defaults`, `lzb/block_data`
* added PHP actions - `lzb/init`
* fixed constructor control Type popup padding
* fixed constructor code preview iframe width
* fixed admin PHP warning when user with Editor role
* fixed blocks conditional displaying in selected post types
* fixed registering user blocks which don't have all control parameters
* fixed registering block inside `init` hook
* fixed BaseControl help with HTML generates JS errors in console
* fixed Select control with Multiple option CSS overflow problem
* fixed templates custom meta settings width
* fixed control label displaying when it is empty
* changed block configs sanitization function priority to prevent possible conflicts
* removed URL control Reset button, use standard icon instead
* disabled custom class name support in Free block
* deprecated action `lzb_handlebars_object`, use `lzb/handlebars/object` instead

= 3.0.0 =

PRO plugin:

* Lazy Blocks Pro is finally released and available here - [https://www.lazyblocks.com/pro/](https://www.lazyblocks.com/pro/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=pro)

FREE plugin:

* a lot of code rewrites to improve stability and performance
* added support for Image control data in the repeater title short tags
* added possibility to save block data with html tags. Supported block description, controls labels and help fields
* added basic styles to the Code Editor control
* added support for "Content Only" lock in Templates
* added support for multiple color palettes (registered in the theme and in Gutenberg itself) in the Color Picker control
* fixed enqueue styles in FSE
* fixed "Hide if block is not selected" option when control displayed in both placements (Inspector and Content)
* fixed "Hide if block is not selected" option to work with inner blocks
* fixed adding defaults to the new row in repeater
* fixed unlocking post saving when remove locked block
* fixed URL control styles
* fixed icon box in admin block list ui when no icon selected
* fixed constructor rendering when 3rd parties use the `allowed_block_types_all` hook
* fixed widgets screen block error
* fixed Classic Editor control in Widgets Screen
* fixed Rest permissions check errors
* fixed error message displaying when block preview is not rendered
* simplified exported block configs (removed fields with default values)
* changed `react-sortable-hoc` to `dnd-kit` - no more error messages in the console
* removed limitation for 3 tags per block
* removed wrapper from controls displayed inside Inspector
* minor changes

= 2.5.3 =

* added block inserter preview (thanks <https://github.com/nk-crew/lazy-blocks/pull/230>)
* fixed PHP8 deprecation warning
* fixed security issue in the code for duplicating post (thanks to the Wordfence team)
* minor changes

= 2.5.2 =

* added support for color slugs in the Color controls when using new FSE themes
* added code preview in the constructor (thanks <https://github.com/nk-crew/lazy-blocks/pull/227>)
* fixed propagating cut event in the constructor (thanks <https://github.com/nk-crew/lazy-blocks/pull/226>)
* removed default value generated for repeaters, as it was not working correctly

= 2.5.1 =

* added "Free Content" block in the Templates editor
* fixed PHP warnings when migrating to v2.5.0

= 2.5.0 =

* improved Templates editor (now you can use Gutenberg editor and insert full-featured blocks)
* fixed `get_lzb_meta` output of array and object values
* fixed Constructor screen title click in WP 5.9
* fixed long block names word wrap in export page
* fixed Color Picker control styles in editor

= 2.4.3 =

* changed post types list limit in the templates editor ()
* changed minimal PHP version to 7.2

= 2.4.2 =

* added option to use the color slug in the Color Picker control (see Output Format option)
* fixed js errors in the widget screen
* changed minimal WP version to 5.8

= 2.4.1 =

* fixed 'wp-editor' deprecated error
* fixed conflict with Widgets Gutenberg editor
* fixed repeater sorting error
* removed accepted list for file control Upload button since it is not working correctly in some cases

= 2.4.0 =

* added support for WordPress 5.8
* added a lot of UI improvements
* added slug check in the block name before register block (fixes possible errors)
* added placeholder color in image and gallery controls if images no more exist in media library
* added control names autocompletion to code editor in the blocks constructor
* fixed multiple select control wrong height and styles
* fixed displaying control post meta using function `get_lzb_meta` when live reload preview
* fixed Classic Control toolbar sticky
* fixed Date Control JS error
* fixed long words render in control labels and descriptions
* fixed PHP 8 deprecated error
* fixed wrong activation hook call

= 2.3.1 =

* added compatibility with WordPress 5.7
* added possibility to display default meta value (without hard code, using native WordPress 5.5+ API)
* improved date time picker styles
* improved constructor controls rendering code
* fixed double classes rendering in editor, when Single Output code enabled
* minor changes

= 2.3.0 =

* added possibility to duplicate blocks
* added top toolbar to admin pages
* improved Date Time picker
  * always display TimePicker component (to let users manually set day, month and year)
  * display only necessary parts of TimePicker component
  * better format on button label
* changed constructor Type selector to modal
* fixed Classic control initialize problem in WordPress 5.6 update
* fixed constructor disabled Update button
* fixed constructor controls label margin
* fixed compatibility with Amazon S3 Offload Media plugin (changed image and gallery controls image URL retrieve method)
* minor changes

= 2.2.0 =

* added possibility to select image preview size for Image and Gallery controls (Medium size by default)
* added possibility to filter custom block output using php filter [https://www.lazyblocks.com/docs/php-filters/lzb-block_render-output/](https://www.lazyblocks.com/docs/php-filters/lzb-block_render-output/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added description data in Image and Gallery controls
* update image and gallery control data in custom block dynamically for output actual image data
* improved custom block template path filters [https://www.lazyblocks.com/docs/php-filters/lzb-block_render-include_template/](https://www.lazyblocks.com/docs/php-filters/lzb-block_render-include_template/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* fixed possibility to use Post data in custom block render preview
* fixed constructor Align attribute duplications bug

= 2.1.1 =

* added possibility to hide admin menu item using php filter [https://www.lazyblocks.com/docs/php-filters/lzb-show_admin_menu/](https://www.lazyblocks.com/docs/php-filters/lzb-show_admin_menu/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* improved icon picker cache method
* fixed controls default values loading while rendering (for example, default value of Checkbox control now will be `false`)
* minor changes

= 2.1.0 =

* added support for WordPress 5.5
* added support for theme template files [https://www.lazyblocks.com/docs/blocks-code/theme-template/](https://www.lazyblocks.com/docs/blocks-code/theme-template/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added Output Format option for Select and Radio controls
  * You can output Label
  * You can output array with Value and Label
* added RTL support
* added code to force enable Gutenberg editor on "lazyblocks" post type pages
* added code for custom blocks constructor pages, that force enables it and inserts
* added support for "Frame" and "Custom CSS" Ghost Kit extensions
* added "PRO Survey" link in the admin menu to get help from users
* changed default category to "text"
  * Don't forget to update categories for all your custom blocks
  * Since WordPress 5.5 added new categories: Text, Media, Design
  * Removed categories: Common, Formatting, Layout
* fixed errors in editor preview, when using `get_lzb_meta` function (now it is working as on frontend)
* fixed slashes save in lazyblocks meta data (fixes custom code slashes)
* fixed custom block code editor content when switching between Frontend and Editor tabs
* fixed JS error when opened "lazyblocks" list admin page
* minor improvements

= 2.0.10 =

* added JS files translation

= 2.0.9 =

* added reset button to URL control

= 2.0.8 =

* added help link to "Save in Meta" control option
* added higher priority for registering post templates (possible fix for custom post types)
* fixed custom fields support conflict with constructor interface

= 2.0.7 =

* fixed JS build error

= 2.0.6 =

* added support for required fields inside repeater
* prevent possible bugs with adding custom blocks using PHP (register custom blocks inside `init` hook with priority = 20)
* fixed repeater and Classic Control usage when all rows opened
* fixed repeater control undefined value error
* fixed custom categories registration conflict with 3rd-party plugins
* fixed update control array data in Constructor (can't clear)

= 2.0.5 =

* added WordPress 5.4 compatibility
* added 12 hours format for Time Picker automatically based on WordPress settings
* removed the possibility to disable both date and time in Date Time Picker control
* fixed inability to remove all controls from custom block

= 2.0.4 =

* fixed possible PHP 7.4 error because of admin Tools export checks

= 2.0.3 =

* fixed error when no icon specified to custom block

= 2.0.2 =

* fixed Date Time Picker control displaying selected value
* fixed Classic Editor control rendering bug when used in multiple custom blocks
* fixed Allow Null value save in Select control
* hide "duplicate" button from Inner Blocks control in constructor

= 2.0.1 =

* fixed checkbox and toggle controls meta filter php error

= 2.0.0 =

* added custom controls API [https://www.lazyblocks.com/docs/examples/create-custom-control/](https://www.lazyblocks.com/docs/examples/create-custom-control/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added Export / Import JSON for custom blocks and templates [https://www.lazyblocks.com/docs/export-blocks/](https://www.lazyblocks.com/docs/export-blocks/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added error messages to File, Image and Gallery controls
* added Width option to controls
* added alongside option to Checkbox and Toggle controls
* added Example Block after plugin activation
* added Classic Editor control [https://www.lazyblocks.com/docs/blocks-controls/classic-editor-wysiwyg/](https://www.lazyblocks.com/docs/blocks-controls/classic-editor-wysiwyg/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added possibility to include plugin code in themes and 3rd-party plugins [https://www.lazyblocks.com/docs/examples/include-lazy-blocks-within-theme-or-plugin/](https://www.lazyblocks.com/docs/examples/include-lazy-blocks-within-theme-or-plugin/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* changed block icons to Material SVG <https://material.io/resources/icons/>
* fixed change value in Rich Text and Code Editor
* fixed errors when no specified block icon or title
* fixed Rich Text control styles
* fixed PHP errors when control type is not defined
* fixed height of Select component
* fixed file control Upload button error, when no allowed mime types selected
* fixed possible PHP warnings when control meta used, but array item doesn't exist
* fixed URL control paddings
* fixed constructor admin list mobile devices styles
* fixed required notice position
* removed Multiple option from Radio control
* constructor
  * improved UI
  * added Duplicate and Delete buttons on controls
  * added icons to Controls
  * added control placeholder if label is not specified
  * added control `no label` if label is not specified
  * improved placement settings (changed select to buttons)
  * improved date time settings (changed select to buttons)
  * fixed select component style
  * fixed select component z-index
  * fixed document tabs margin
  * fixed overflow and dropdowns sidebar

= 1.8.2 =

* fixes for WordPress 5.3
* fixed placement control when enabled option `hide_if_not_selected` and set `placement` to `inspector`

= 1.8.0 =

* added support for PHP output method (instead of Handlebars)
* added new Repeater options:
  * Row Label
  * Add Button Label
  * Minimum Rows
  * Maximum Rows
  * Collapsible Rows
* added Characters Limit option to text controls
* added js actions to PreviewServerCallback component (before change and after change), useful for developers [https://www.lazyblocks.com/docs/js-actions/](https://www.lazyblocks.com/docs/js-actions/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added support for [Ghost Kit](https://ghostkit.io/) Extensions
* added `callback` and `allow_wrapper` filters for both contexts using single filter name (frontend and editor) [https://www.lazyblocks.com/docs/php-filters/](https://www.lazyblocks.com/docs/php-filters/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog#render-callback)
* added filter for output attributes [https://www.lazyblocks.com/docs/php-filters/](https://www.lazyblocks.com/docs/php-filters/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog#attributes)
* improved Meta setting (use control name as meta if custom meta name is not defined)
* fixed encoded values in Repeater controls
* fixed possibility to add more than 1 InnerBlocks control per custom block

= 1.7.0 =

* added experimental Required option for top-level controls
* added possibility to choose which custom blocks and template export on Tools page
* changed Templates page to use React
* changed Tools page to use React
* fixed PHP error when className is not available in the custom block
* fixed PHP warning when used multiple select options
* minor changes

= 1.6.2 =

* added File control
* changed anchor attribute settings (fixed anchor save in the latest Gutenberg)
* fixed select control value save (if no Multiple option set)
* fixed InnerBlocks with option "Hide if block is not selected"
* fixed boolean meta data of constructor save (convert to string)

= 1.6.1 =

* fixed order of controls was not saved
* fixed php error when no custom blocks available
* fixed selecting inner repeater controls
* fixed control styles disappear while resorting
* prevent control selection on drag handler click
* prevent control selection on repeater toggle click

= 1.6.0 =

* Improved Constructor UI
  * Custom block setting moved to the right side (Inspector)
  * Control setting opens in Inspector when you select it
* added alpha channel option to Color Picker control
* added 'Save in Meta' support for Repeater field
* added possibility to hide custom block previews in editor
* added possibility to use single code output for both Frontend and Editor
* added Select Multiple option
* fixed custom block preview loading when returned empty string
* fixed Keywords, Align and Condition custom block settings save when empty

= 1.5.1 =

* added block slug validation in constructor
* added slug creation if don't exist after block title added
* fixed controls saving in new custom blocks
* fixed icon picker button styles in constructor

= 1.5.0 =

* changed Block Constructor page to Gutenberg
* added option to hide controls if custom block is not selected
* added Radio control
* fixed duplicating of categories selector in custom blocks constructor
* fixed custom block ID duplication
* fixed custom block preview loading error
* fixed custom block names some characters
* fixed custom post types publishing
* fixed error if custom post type removed, but the template for this post is still available

= 1.4.3 =

* fixed controls save when updating Lazy Blocks post in WordPress 5.1

= 1.4.2 =

* added `lzb/handlebars/object` action inside `init`
* trim class attribute value on frontend output
* fixed loading Templates admin page and select initialization when more then 1 template added
* fixed Range control with Save in Meta option
* fixed JS error on all admin pages
* fixed Handlebars PHP 7.3 error

= 1.4.1 =

* added action to add Handlebars custom helpers (info in documentation)
* added filter to disable frontend block wrapper of the custom block (info in documentation)
* improved columns in admin list of custom blocks
* extended list of symbols that need to be removed from the block slug
* fixed PHP output for frontend if HTML output is empty
* fixed losing Frontend & Editor output data when added output PHP filters

= 1.4.0 =

* added support for custom blocks PHP preview rendering in Editor
* added toggle button in Repeater control to toggle all rows
* added custom block slug validation and automatic creation in constructor
* added descriptions to additional block fields in constructor
* added new attribute `blockUniqueClass` that will adds automatically on each custom block
* added title on Image and Gallery attributes object
* changed Editor rendering to AJAX also for Handlebars templates
* changed output for custom blocks - always added wrapper with block class

= 1.3.2 =

* added unique `blockUniqueClass` attribute to each custom block attributes and in editor wrapper

= 1.3.1 =

* added unique `blockId` attribute to each custom block
* simplified enqueue in admin templates page
* fixed do_shortcode wrong attributes output (reserved `data` and `hash` attributes)
* fixed Range control saving value

= 1.3.0 =

* added filter for output frontend PHP of custom blocks ([read in documentation](https://www.lazyblocks.com/docs/blocks-code/php/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog))
* added Allow Null option to Select control
* added Help option in controls
* added Placeholder option in controls
* added all existing categories in custom block categories selector
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
* added support for custom frontend render function (use PHP instead of Handlebars) [https://www.lazyblocks.com/docs/blocks-code/php/](https://www.lazyblocks.com/docs/blocks-code/php/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
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
* improved **do_shortcode** handlebars helper to work with attributes. Read here how to use - [https://www.lazyblocks.com/docs/docs/examples/shortcode-gutenberg/](https://www.lazyblocks.com/docs/docs/examples/shortcode-gutenberg/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* fixed image field data conversion to array

= 1.0.2 =

* changed admin menu method (simplified)
* fixed capabilities bug [https://wordpress.org/support/topic/permission-error-when-accessing-plugins-admin-pages/](https://wordpress.org/support/topic/permission-error-when-accessing-plugins-admin-pages/)

= 1.0.0 =

* Initial Release
