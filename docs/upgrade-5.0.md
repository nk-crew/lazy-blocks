# Updating integrations to Lazy Blocks 5.0

## Block wrappers

The filters `lzb/block_render/allow_wrapper`, `{slug}/frontend_allow_wrapper`,
and `{slug}/allow_wrapper` still run in 5.0. For a template with one root element,
put [`useBlockProps`](https://www.lazyblocks.com/docs/blocks-code/use-block-props/)
on that element:

```html
<section useBlockProps class="feature">...</section>
```

On a staging copy, disable the old callback and compare the generated HTML,
wrapper classes, and CSS on a saved post. Keep the callback if the block needs
wrapper-free markup or multiple root elements and applying the marker changes
the output you depend on.

## Handlebars helpers

Register your existing callback on `lzb/handlebars/object` instead of
`lzb_handlebars_object`. Keep the callback priority, helper name, and published
template. For example, change the registration to
`add_action( 'lzb/handlebars/object', 'my_register_helpers', 10 );`.

## PHP template files outside the theme

Replace `lzb/template_exists` and `lzb/include_template` with
`lzb/block_render/template_exists` and `lzb/block_render/include_template`.
The existence filter receives the requested filename. The include filter
receives the theme lookup result, block attributes, block definition, render
location, and context. Lazy Blocks checks `editor.php` first in the editor,
then falls back to `block.php`. On the frontend it checks `block.php`.

Use the same resolver in both callbacks so they agree on the path. This
example belongs in the plugin that provides both files and owns
`lazyblock/example`. It checks the plugin directory first for each filename,
then uses the theme lookup.

```php
function my_example_template_path( $filename, $theme_path ) {
    $plugin_path = __DIR__ . '/blocks/example/' . $filename;

    return is_file( $plugin_path ) ? $plugin_path : $theme_path;
}

add_filter(
    'lzb/block_render/template_exists',
    static function ( $path, $requested, $attributes, $block ) {
        if ( 'lazyblock/example' !== $block['slug'] ) {
            return $path;
        }

        return my_example_template_path( basename( $requested ), $path );
    },
    10,
    4
);

add_filter(
    'lzb/block_render/include_template',
    static function ( $path, $attributes, $block, $location ) {
        if ( 'lazyblock/example' !== $block['slug'] ) {
            return $path;
        }

        if ( 'editor' === $location ) {
            $editor = my_example_template_path(
                'editor.php',
                locate_template( '/blocks/lazyblock-example/editor.php' )
            );

            if ( is_file( $editor ) ) {
                return $editor;
            }
        }

        return my_example_template_path( 'block.php', $path );
    },
    10,
    4
);
```

When old and new filters are both registered, each legacy filter runs after the
corresponding current filters and receives their result. Keep the legacy include
filter if your callback needs the exact requested filename. The current include
filter has no argument for that filename or the path returned by the existence
filter.

## Preview events

Use `lzb.components.PreviewServerCallback.onBeforeChange` and
`lzb.components.PreviewServerCallback.onChange`. The two actions use the same
callback arguments and run at the same points as their `lazyblocks.`
counterparts. Select one prefix per listener to avoid handling the same update
twice.

## Block exports

Re-export the block or edit its PHP registration in the theme or plugin.
Replace `code.use_php => true` with `code.output_method => 'php'` and
`code.use_php => false` with `code.output_method => 'html'`. If the export
already defines `code.output_method`, keep that value and remove `code.use_php`.

## Role capabilities

Use `lazyblocks()->blocks()->sync_role_caps()` instead of
`lazyblocks()->blocks()->add_role_caps()`. Both calls apply the same capabilities
in 5.0.

## Abilities that write blocks

Run the abilities as a user who can post unfiltered HTML when the input sets
`code_frontend_html`, `code_editor_html`, or `script_view`. For other users
the ability returns `lazy_blocks_unfiltered_html_required` and saves nothing.
Sending back the saved value of a code field, as `lazy-blocks/get-block`
returns it, is allowed.

## Filter block data before saving

Use `lzb/block_data_before_write` to filter a block definition before Lazy Blocks
writes its metadata. The three callback arguments are the proposed metadata,
the stored metadata of the destination block, and a context with `source` and
`post_id`. Both metadata arrays use keys like `lazyblocks_controls` and unslashed
values. Proposed values keep the write source's PHP types. For example, an
ability update can contain a boolean where the stored value is a string. The
stored array contains only saved fields, with the first stored value per key.
For a new block this array is normally empty. For users without
`unfiltered_html`, submitted text is sanitized before the callback runs.

The source is `rest` for the builder and the update-block-data endpoint,
`ability_create` or `ability_update` for the write abilities, `import` for block
imports, `duplicate` for copies, or `direct` for other callers of the shared
writer. For `ability_create`, the filter runs before the post is inserted,
so `post_id` is `0` and the stored array is empty. Abilities validate changes to
the slug from the filter before writing. On `ability_update`, the filter runs
before any requested title update. Register the callback before that phase.
When an update also changes the title, changes made by the filter take precedence
over metadata written by WordPress title-save callbacks. Other fields keep
those callbacks' values unless the ability input explicitly sets them.

Return the fields to write. For example, assign a stored field to the same key
in the proposed array to keep its value.

For duplicates, the filter runs once per source row position. Fields on that
row use the matching proposed and stored values. Fields without a source row at
that position carry their first values as context. Return a field to copy its
current row or omit the field to skip that row. The first call can also add
fields registered through the block defaults. Other metadata is copied as usual.
