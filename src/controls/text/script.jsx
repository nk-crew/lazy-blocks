const { __ } = wp.i18n;

const { Fragment } = wp.element;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    TextControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.text.render', 'lzb.editor', ( render, props ) => {
    const maxlength = props.data.characters_limit ? parseInt( props.data.characters_limit ) : '';

    return (
        <TextControl
            label={ props.data.label }
            maxLength={ maxlength }
            help={ props.data.help }
            placeholder={ props.data.placeholder }
            value={ props.getValue() }
            onChange={ props.onChange }
        />
    );
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.text.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <Fragment>
            <PanelBody>
                <TextControl
                    label={ __( 'Placeholder', '@@text_domain' ) }
                    value={ data.placeholder }
                    onChange={ ( value ) => updateData( { placeholder: value } ) }
                />
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Characters Limit', '@@text_domain' ) }
                    help={ __( 'Maximum number of characters allowed. Leave blank to no limit.', '@@text_domain' ) }
                >
                    <TextControl
                        value={ data.characters_limit ? parseInt( data.characters_limit, 10 ) : '' }
                        type="number"
                        min={ 0 }
                        max={ 524288 }
                        onChange={ ( value ) => updateData( { characters_limit: `${ value }` } ) }
                    />
                </BaseControl>
            </PanelBody>
        </Fragment>
    );
} );
