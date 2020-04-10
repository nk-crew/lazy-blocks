const {
    addFilter,
} = wp.hooks;

const {
    BaseControl,
} = wp.components;

const {
    __experimentalLinkControl: LinkControl,
} = wp.blockEditor;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.url.render', 'lzb.editor', ( render, props ) => {
    return (
        <BaseControl
            label={ props.data.label }
            help={ props.data.help }
        >
            <div className="lzb-gutenberg-url">
                <LinkControl
                    className="wp-block-navigation-link__inline-link-input"
                    opensInNewTab={ false }
                    value={ {
                        url: props.getValue(),
                    } }
                    onChange={ ( { url: newURL = '' } ) => {
                        props.onChange( newURL );
                    } }
                />
            </div>
        </BaseControl>
    );
} );
