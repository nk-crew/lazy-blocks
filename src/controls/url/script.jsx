import shorthash from 'shorthash';

const {
    useState,
} = wp.element;

const {
    __,
} = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    BaseControl,
    Button,
} = wp.components;

const {
    __experimentalLinkControl: LinkControl,
} = wp.blockEditor;

function ComponentRender( props ) {
    const [ key, setKey ] = useState( shorthash.unique( `${ new Date() }` ) );

    return (
        <BaseControl
            label={ props.data.label }
            help={ props.data.help }
        >
            <div className="lzb-gutenberg-url">
                <LinkControl
                    key={ key }
                    className="wp-block-navigation-link__inline-link-input"
                    opensInNewTab={ false }
                    value={ {
                        url: props.getValue(),
                    } }
                    onChange={ ( { url: newURL = '' } ) => {
                        props.onChange( newURL );
                    } }
                />
                { props.getValue() ? (
                    <Button
                        isSmall
                        isSecondary
                        onClick={ () => {
                            props.onChange( '' );
                            setKey( shorthash.unique( `${ new Date() }` ) );
                        } }
                    >
                        { __( 'Reset', '@@text_domain' ) }
                    </Button>
                ) : '' }
            </div>
        </BaseControl>
    );
}

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.url.render', 'lzb.editor', ( render, props ) => (
    <ComponentRender { ...props } />
) );
