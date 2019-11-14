import ComponentChoices from '../select/component-choices';

const { __ } = wp.i18n;

const { Fragment } = wp.element;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    RadioControl,
    CheckboxControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.radio.render', 'lzb.editor', ( render, props ) => {
    return (
        <RadioControl
            label={ props.data.label }
            help={ props.data.help }
            selected={ props.getValue() }
            options={ props.data.choices }
            onChange={ props.onChange }
        />
    );
} );

/**
 * Control value valid in editor.
 */
addFilter( 'lzb.editor.control.radio.isValueValid', 'lzb.editor', ( isValid, value, data ) => {
    if ( 'true' === data.allow_null ) {
        isValid = true;
    }

    return isValid;
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.radio.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    return (
        <Fragment>
            <PanelBody>
                <ComponentChoices { ...props } />
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Allow Null' ) }
                    help={ __( 'Allows you to reset selected option value to null' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.allow_null }
                        onChange={ ( value ) => updateData( { allow_null: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Multiple' ) }
                    help={ __( 'Allows you to select multiple values' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.multiple }
                        onChange={ ( value ) => updateData( { multiple: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
        </Fragment>
    );
} );
