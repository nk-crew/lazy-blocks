import ColorControl from './color-control';

const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    ToggleControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.color.render', 'lzb.editor', ( render, props ) => (
    <ColorControl
        label={ props.data.label }
        help={ props.data.help }
        alpha={ 'true' === props.data.alpha }
        value={ props.getValue() }
        onChange={ props.onChange }
    />
) );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.color.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <PanelBody>
            <BaseControl
                label={ __( 'Alpha Channel', '@@text_domain' ) }
                help={ __( 'Will be added option that allow you to set semi-transparent colors with rgba', '@@text_domain' ) }
            >
                <ToggleControl
                    label={ __( 'Yes', '@@text_domain' ) }
                    checked={ 'true' === data.alpha }
                    onChange={ ( value ) => updateData( { alpha: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        </PanelBody>
    );
} );
