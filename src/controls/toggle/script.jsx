const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    ToggleControl,
    CheckboxControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.toggle.render', 'lzb.editor', ( render, props ) => {
    return (
        <ToggleControl
            label={ props.data.label }
            checked={ !! props.getValue() }
            help={ props.data.help }
            onChange={ props.onChange }
        />
    );
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.toggle.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <PanelBody>
            <BaseControl
                label={ __( 'Checked' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.checked }
                    onChange={ ( value ) => updateData( { checked: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        </PanelBody>
    );
} );
