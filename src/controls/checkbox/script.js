const { __ } = wp.i18n;

const { Fragment } = wp.element;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    TextControl,
    CheckboxControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.checkbox.render', 'lzb.editor', ( render, props ) => (
    <BaseControl label={ props.data.label }>
        <CheckboxControl
            label={ props.data.alongside_text }
            checked={ !! props.getValue() }
            help={ props.data.help }
            onChange={ props.onChange }
        />
    </BaseControl>
) );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.checkbox.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <Fragment>
            <PanelBody>
                <TextControl
                    label={ __( 'Alongside Text', '@@text_domain' ) }
                    help={ __( 'Displays text alongside the checkbox', '@@text_domain' ) }
                    value={ data.alongside_text }
                    onChange={ ( value ) => updateData( { alongside_text: value } ) }
                />
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Checked', '@@text_domain' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes', '@@text_domain' ) }
                        checked={ 'true' === data.checked }
                        onChange={ ( value ) => updateData( { checked: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
        </Fragment>
    );
} );
