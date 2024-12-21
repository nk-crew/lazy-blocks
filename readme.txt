# Custom Block Builder - Lazy Blocks

* Contributors: nko
* Tags: gutenberg, blocks, custom, meta, fields
* Donate link: https://www.lazyblocks.com/pro/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=donate
* Requires at least: 6.2
* Tested up to: 6.7
* Requires PHP: 7.2
* Stable tag: 3.8.3
* License: GPLv2 or later
* License URI: <http://www.gnu.org/licenses/gpl-2.0.html>

Easily create custom blocks and custom meta fields for Gutenberg without hard coding.

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

1. Block Builder
2. Custom Blocks with Example Controls
3. Posts Templates

## Changelog

= 3.8.3 - Dec 21, 2024 =

* fixed XSS issue in admin blocks list page

= 3.8.2 - Dec 13, 2024 =

* **Pro**
* fixed automatic plugins update. In case you can't automatically update plugin, install it manually https://www.lazyblocks.com/docs/account-and-license/download-lazy-blocks-pro-plugin/

= 3.8.1 - Dec 10, 2024 =

* remove experimental notice under WPML setting
* minor changes in readme
* **Pro**:
* fixed block crash when conditional logic added to the control which is no longer exists

= 3.8.0 - Dec 7, 2024 =

* added WordPress 6.7 compatibility
* added better error messages to block Inspector and to the editor toolbar when block has invalid required controls
* added prompt to remove metadata from post after removing block which contains the control with Save in Meta option enabled
* added possibility to clear the Gallery control
* added duplicate row button to Repeater control
* added `wp_get_attachment_image` Handlebars helper
* added possibility to activate/deactivate blocks
* added support for embed links to the Classic Editor control
* added Groups for Inspector - Default, Styles and Advanced
* added reset button to Time control
* added Multiple option support for Checkbox control
* improved Repeater control UI
* improved block duplication process - add copy suffix and disabled block by default
* improved control with Save in Meta displaying in the editor of post, which does not support custom fields
* fixed invalid block builder render when there are no blocks registered
* fixed offsetHeight JS error in block builder preview
* fixed hardcoded `wp-content` string in the block builder UI: changed to wp content dir core constant
* fixed displaying default block icon in blocks list admin UI
* fixed saving of Repeater row addition and removal in undo/redo manager
* fixed align class rendering in block when align attribute is disabled
* prevent changing block post statuses - support only draft and publish
* rename Constructor to Block Builder
* removed advanced validation from the URL control to prevent required check fails on relative links or links to applications
* removed the ability to use URL control within Content, since the Gutenberg no longer renders it correctly here
* **Pro:**
* added possibility to change block slug Namespace and register Collection
* fixed block editor styles for Code control extension
* migrate Pro plugin from Paddle to LemonSqueezy

= 3.7.0 - May 23, 2024 =

* improved Required control options - added more validation checks and better error messages
* fixed Classic control loading in legacy Widgets screen
* fixed Number/Range controls default value `0` when it is not selected
* changed `lzb.editor.control.isValueValid` hook to `lzb.editor.control.validate`
* removed Multiline option from RichText control as it is deprecated

= 3.6.2 - May 1, 2024 =

* added error handler to prevent block from breaking in editor when there are invalid HTML in block output
* fixed get_meta_value_by_block method to not crash if no meta available

= 3.6.1 - Mar 21, 2024 =

* reverted the code for validating HTML as it does more harm than good. In the next update, we will need to add error handlers in JS instead of trying to validate HTML inside PHP.

= 3.6.0 - Mar 15, 2024 =

PRO plugin:

* fixed decoding of WPML encoded strings in conditional logic in editor

Free + PRO plugin:

* added compatibility for the latest Gutenberg and WordPress 6.5
* added error handler for invalid HTML. The block will no longer crash, it will display the error message
* added support for new Ghost Kit extensions
* changed Classic control to use Modal since we can no longer use the TinyMCE inside editor iframe
* fixed styles enqueue in editor iframe
* fixed adding default toggle/checkbox value in the new repeater row
* fixed `react-select` styles render inside editor iframe
* fixed `react-select` removing items by clicking on X button
* fixed decoding of WPML encoded strings in repeater, gallery, file and image controls in editor
* fixed displaying Navigation and Patterns in block Condition selector
* fixed loading block control scripts in block builder when no blocks registered yet

= 3.5.1 - Aug 30, 2023 =

* fixed JS error in editor in block containing `<script>` tag in content when preview showed

= 3.5.0 - Aug 18, 2023 =

* added support for WordPress 6.3
* all blocks now have `apiVersion` 3, which means that in the latest Gutenberg you will have an iframed page editor
* fixed block rendering error inside core/group block
* fixed editor error when view block preview or add a couple of reusable blocks
* minor changes

= 3.4.5 - Jul 24, 2023 =

* fixed wrong template rendering in Editor after InnerBlocks component used

= 3.4.4 - Jul 20, 2023 =

* fixed InnerBlocks component rendering number values with `$` character

= 3.4.3 - Jul 12, 2023 =

PRO plugin:

* fixed JS error in Posts control in editor

FREE plugin:

* fixed blocks rendering on Widgets screen
* fixed default value with an empty array element of multi select
* fixed JS error in multiple Select control in editor when null value

= 3.4.2 - Jul 1, 2023 =

PRO plugin:
FREE plugin:

* fixed Anchor option and ID attribute rendering in the block wrapper (Gutenberg reverted feature for automatic Anchor render in the dynamic blocks)

= 3.4.1 - Jun 30, 2023 =

PRO plugin:

* added higher priority for block preloading feature to let 3rd-parties hook the output before preloading

FREE plugin:

* added defaults to user registered blocks (fixes the problem, when old registration configs fails when we add new parameters)
* added `remove_block` method to the Blocks class to allow removing user registered blocks
* added filter `lzb/block_render/allow_inner_blocks_wrapper`
* added support for `className` attribute in `<InnerBlocks />` component
* skip control assets enqueue if there are no blocks registered (fixes the JS error in editor)
* fixed nested blocks not displaying appender button with InnerBlocks component

= 3.4.0 - Jun 24, 2023 =

PRO plugin:

* added controls conditions based on selected block style or for a specific class name
* added support for Term ID output in Taxonomy control
* added `lazy-blocks.php` file as a helper when included within a theme or plugin
* added support for Equal and Contains conditions for Units control
* added `==class` and `!=class` condition operators
* changed saved attribute of Taxonomy control to ID when selected Term Object
* fixed Posts and URL controls not displaying all available post types

FREE plugin:

* added `<InnerBlocks />` component support. Learn more here - <https://www.lazyblocks.com/docs/blocks-code/inner-blocks/>
  * it is required to change your block code to use `<InnerBlocks />` component if you use the InnerBlocks control
  * the old InnerBlocks control is now marked as deprecated and will be removed in future plugin updates
* added possibility to register Block Styles <https://developer.wordpress.org/block-editor/reference-guides/block-api/block-styles/>
* added option for Image control to insert from URL
* added new Supports settings - Reusable and Lock
* added possibility to sort tags inside the Select component
* added width support for controls in the block builder UI
* added apiVersion 3 to blocks
* added `include_within` method to include plugin within theme or plugin. Learn more here <https://www.lazyblocks.com/docs/examples/include-lazy-blocks-within-theme-or-plugin/#how-to-include-plugin-files>
* added `lzb/control_value` filters. Learn more here <https://www.lazyblocks.com/docs/php-filters/lzb-control_value/>
* added `filter_control_value` method into the Base control class for 3rd-party controls
* added JS hook `useBlockControlProps` to use in 3rd-party controls
* added helpful attributes to control wrappers such as `data-lazyblocks-control-name`
* added control values filtering inside the repeater rows
* added `Toggle all` label to Repeater control toggle
* improved Repeater control to automatically open a newly added Row
* improved Free block and InnerBlocks appender style in editor (Displays like in core blocks)
* improved usage of Lazy Block's `render_callback` to prevent conflicts with Gutenberg's `render_callback`
* improved meta controls, templates editor - use `useEntityProp` instead of `editPost`
* improved Color Picker control:
  * use a single toggle to open the full color palette
  * added option to disable color palette
  * added Alongside text option
* moved Ghost Kit supports settings to separate panel in block builder
* moved Edit Block icon to the block toolbar
* changed `import_block` method to public in Tools class
* changed bundler to `wp-scripts` - faster builds and development process
* fixed styles loading inside the editor iframe
* fixed block render duplicate custom CSS and anchor
* fixed Classic Editor error in widgets editor
* fixed block builder styles in editor with Astra theme
* fixed JS error when `condition` field is not added in the PHP block registration
* fixed sortable inside editor iframe
* fixed displaying label and help in controls, where these settings are disabled
* fixed duplicate Redux store loading inside block builder
* removed CodeEditor component from lazyblocks Redux store (reduced editor.js file size)
* removed `throttle-debounce` usage, use lodash instead
* removed HTML elements from block descriptions, as it is deprecated since WordPress v6.2

= 3.3.0 - Jan 4, 2023 =

PRO plugin:

* added support for Repeater control in the Conditional Logic

FREE plugin:

* added notice for invalid control name when creating block
* fixed Preview component JS actions call after fetch complete
* fixed displaying Date and Time pickers
* fixed Date Time Picker displaying date in the toggle label

= 3.2.1 - Dec 4, 2022 =

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

= 3.1.0 - Nov 16, 2022 =

PRO plugin:

* added block preloading feature - all blocks loaded immediately, when you open the page editor
* added support for content analysis in Rank Math and Yoast
* added setting to remove block frame in page editor and display it as native block
* added Link Suggestions option to URL control (select post types to suggest links when typing)
* added Rich Preview option to URL control (display page title and image of selected URL)

FREE plugin:

* added support for Blocks API v2
* added `lzb/init` hook for developers to register blocks in PHP
* added autoFocus to block builder control Type popup input search
* added autoFocus to choices component when adding new choice
* added JS filters - `lzb.components.PreviewServerCallback.allowFetch`, `lzb.constructor.code-settings.output-method`, `lzb.constructor.code-settings.output-code`, `lzb.constructor.code-settings.output-template`, `lzb.constructor.code-settings.preview`, `lzb.constructor.code-settings.additional`
* added PHP filters - `lzb/block_defaults`, `lzb/block_data`
* added PHP actions - `lzb/init`
* fixed block builder control Type popup padding
* fixed block builder code preview iframe width
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

= 3.0.0 - Nov 9, 2022 =

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
* fixed block builder rendering when 3rd parties use the `allowed_block_types_all` hook
* fixed widgets screen block error
* fixed Classic Editor control in Widgets Screen
* fixed Rest permissions check errors
* fixed error message displaying when block preview is not rendered
* simplified exported block configs (removed fields with default values)
* changed `react-sortable-hoc` to `dnd-kit` - no more error messages in the console
* removed limitation for 3 tags per block
* removed wrapper from controls displayed inside Inspector
* minor changes

= 2.5.3 - Jan 8, 2022 =

* added block inserter preview (thanks <https://github.com/nk-crew/lazy-blocks/pull/230>)
* fixed PHP8 deprecation warning
* fixed security issue in the code for duplicating post (thanks to the Wordfence team)
* minor changes

= 2.5.2 - Dec 6, 2021 =

* added support for color slugs in the Color controls when using new FSE themes
* added code preview in the block builder (thanks <https://github.com/nk-crew/lazy-blocks/pull/227>)
* fixed propagating cut event in the block builder (thanks <https://github.com/nk-crew/lazy-blocks/pull/226>)
* removed default value generated for repeaters, as it was not working correctly

= 2.5.1 - Nov 5, 2021 =

* added "Free Content" block in the Templates editor
* fixed PHP warnings when migrating to v2.5.0

= 2.5.0 - Nov 5, 2021 =

* improved Templates editor (now you can use Gutenberg editor and insert full-featured blocks)
* fixed `get_lzb_meta` output of array and object values
* fixed Block Builder screen title click in WP 5.9
* fixed long block names word wrap in export page
* fixed Color Picker control styles in editor

= 2.4.3 - Sep 27, 2021 =

* changed post types list limit in the templates editor ()
* changed minimal PHP version to 7.2

= 2.4.2 - Sep 22, 2021 =

* added option to use the color slug in the Color Picker control (see Output Format option)
* fixed js errors in the widget screen
* changed minimal WP version to 5.8

= 2.4.1 - Aug 27, 2021 =

* fixed 'wp-editor' deprecated error
* fixed conflict with Widgets Gutenberg editor
* fixed repeater sorting error
* removed accepted list for file control Upload button since it is not working correctly in some cases

= 2.4.0 - Aug 18, 2021 =

* added support for WordPress 5.8
* added a lot of UI improvements
* added slug check in the block name before register block (fixes possible errors)
* added placeholder color in image and gallery controls if images no more exist in media library
* added control names autocompletion to code editor in the block builder
* fixed multiple select control wrong height and styles
* fixed displaying control post meta using function `get_lzb_meta` when live reload preview
* fixed Classic Control toolbar sticky
* fixed Date Control JS error
* fixed long words render in control labels and descriptions
* fixed PHP 8 deprecated error
* fixed wrong activation hook call

= 2.3.1 - Mar 19, 2021 =

* added compatibility with WordPress 5.7
* added possibility to display default meta value (without hard code, using native WordPress 5.5+ API)
* improved date time picker styles
* improved block builder controls rendering code
* fixed double classes rendering in editor, when Single Output code enabled
* minor changes

= 2.3.0 - Jan 10, 2021 =

* added possibility to duplicate blocks
* added top toolbar to admin pages
* improved Date Time picker
  * always display TimePicker component (to let users manually set day, month and year)
  * display only necessary parts of TimePicker component
  * better format on button label
* changed block builder Type selector to modal
* fixed Classic control initialize problem in WordPress 5.6 update
* fixed block builder disabled Update button
* fixed block builder controls label margin
* fixed compatibility with Amazon S3 Offload Media plugin (changed image and gallery controls image URL retrieve method)
* minor changes

Further changelog entries can be found in the [CHANGELOG.md](https://github.com/nk-crew/lazy-blocks/blob/master/CHANGELOG.md) file.
