const { __ } = wp.i18n;

const { Fragment } = wp.element;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    TextControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.number.render', 'lzb.editor', ( render, props ) => {
    const maxlength = props.data.characters_limit ? parseInt( props.data.characters_limit ) : '';

    return (
        <TextControl
            type="number"
            label={ props.data.label }
            maxLength={ maxlength }
            min={ props.data.min }
            max={ props.data.max }
            step={ props.data.step }
            help={ props.data.help }
            placeholder={ props.data.placeholder }
            value={ props.getValue() }
            onChange={ ( val ) => {
                props.onChange( parseFloat( val ) );
            } }
        />
    );
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.number.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <Fragment>
            <PanelBody>
                <TextControl
                    label={ __( 'Minimum Value' ) }
                    type="number"
                    step={ data.step }
                    value={ data.min }
                    onChange={ ( value ) => updateData( { min: value } ) }
                />
            </PanelBody>
            <PanelBody>
                <TextControl
                    label={ __( 'Maximum Value' ) }
                    type="number"
                    step={ data.step }
                    value={ data.max }
                    onChange={ ( value ) => updateData( { max: value } ) }
                />
            </PanelBody>
            <PanelBody>
                <TextControl
                    label={ __( 'Step Size' ) }
                    type="number"
                    value={ data.step }
                    onChange={ ( value ) => updateData( { step: value } ) }
                />
            </PanelBody>
            <PanelBody>
                <TextControl
                    label={ __( 'Placeholder' ) }
                    value={ data.placeholder }
                    onChange={ ( value ) => updateData( { placeholder: value } ) }
                />
            </PanelBody>
        </Fragment>
    );
} );
