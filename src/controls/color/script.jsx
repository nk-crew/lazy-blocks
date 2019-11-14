import ColorControl from './color-control';

const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    CheckboxControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.color.render', 'lzb.editor', ( render, props ) => {
    return (
        <ColorControl
            label={ props.data.label }
            help={ props.data.help }
            alpha={ props.data.alpha === 'true' }
            value={ props.getValue() }
            onChange={ props.onChange }
        />
    );
} );

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
                label={ __( 'Alpha Channel' ) }
                help={ __( 'Will be added option that allow you to set semi-transparent colors with rgba' ) }
            >
                <CheckboxControl
                    label={ __( 'Yes' ) }
                    checked={ 'true' === data.alpha }
                    onChange={ ( value ) => updateData( { alpha: value ? 'true' : 'false' } ) }
                />
            </BaseControl>
        </PanelBody>
    );
} );
