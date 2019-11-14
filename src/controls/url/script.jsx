const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    Dashicon,
    IconButton,
    BaseControl,
} = wp.components;

const {
    URLInput,
} = wp.blockEditor;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.url.render', 'lzb.editor', ( render, props ) => {
    return (
        <PanelBody>
            <BaseControl
                label={ props.data.label }
                help={ props.data.help }
            >
                <form
                    className="lzb-gutenberg-url"
                    onSubmit={ ( event ) => event.preventDefault() }>
                    <URLInput
                        value={ props.getValue() }
                        onChange={ props.onChange }
                        autoFocus={ false }
                    />
                    <Dashicon icon="admin-links" />
                    <IconButton icon="editor-break" label="Apply" type="submit" />
                </form>
            </BaseControl>
        </PanelBody>
    );
} );
