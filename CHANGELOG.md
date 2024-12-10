# Changelog

All notable changes to this project will be documented in this file.

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

= 2.2.0 =

* added possibility to select image preview size for Image and Gallery controls (Medium size by default)
* added possibility to filter custom block output using php filter [https://www.lazyblocks.com/docs/php-filters/lzb-block_render-output/](https://www.lazyblocks.com/docs/php-filters/lzb-block_render-output/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* added description data in Image and Gallery controls
* update image and gallery control data in custom block dynamically for output actual image data
* improved custom block template path filters [https://www.lazyblocks.com/docs/php-filters/lzb-block_render-include_template/](https://www.lazyblocks.com/docs/php-filters/lzb-block_render-include_template/?utm_source=wordpress.org&utm_medium=changelog&utm_campaign=changelog)
* fixed possibility to use Post data in custom block render preview
* fixed block builder Align attribute duplications bug

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
* added code for custom block builder pages, that force enables it and inserts
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
* fixed custom fields support conflict with block builder interface

= 2.0.7 =

* fixed JS build error

= 2.0.6 =

* added support for required fields inside repeater
* prevent possible bugs with adding custom blocks using PHP (register custom blocks inside `init` hook with priority = 20)
* fixed repeater and Classic Control usage when all rows opened
* fixed repeater control undefined value error
* fixed custom categories registration conflict with 3rd-party plugins
* fixed update control array data in Block Builder (can't clear)

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
* hide "duplicate" button from Inner Blocks control in block builder

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
* fixed block builder admin list mobile devices styles
* fixed required notice position
* removed Multiple option from Radio control
* block builder
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
* fixed boolean meta data of block builder save (convert to string)

= 1.6.1 =

* fixed order of controls was not saved
* fixed php error when no custom blocks available
* fixed selecting inner repeater controls
* fixed control styles disappear while resorting
* prevent control selection on drag handler click
* prevent control selection on repeater toggle click

= 1.6.0 =

* Improved Block Builder UI
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

* added block slug validation in block builder
* added slug creation if don't exist after block title added
* fixed controls saving in new custom blocks
* fixed icon picker button styles in block builder

= 1.5.0 =

* changed Block Builder page to Gutenberg
* added option to hide controls if custom block is not selected
* added Radio control
* fixed duplicating of categories selector in custom block builder
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
* added custom block slug validation and automatic creation in block builder
* added descriptions to additional block fields in block builder
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
* fixed automatic fill of control name in block builder
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
