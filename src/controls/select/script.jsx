import ComponentChoices from './component-choices';

const { __ } = wp.i18n;

const { Fragment } = wp.element;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    SelectControl,
    CheckboxControl,
    RadioControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.select.render', 'lzb.editor', ( render, props ) => {
    let { choices } = props.data;

    // allow null.
    if ( props.data.allow_null && 'true' === props.data.allow_null ) {
        choices = [
            {
                value: '',
                label: __( '-- Select --', '@@text_domain' ),
            },
            ...choices,
        ];
    }

    return (
        <SelectControl
            label={ props.data.label }
            options={ choices }
            multiple={ 'true' === props.data.multiple }
            help={ props.data.help }
            value={ props.getValue() }
            className="lzb-gutenberg-select"
            onChange={ ( val ) => {
                props.onChange( val );
            } }
        />
    );
} );

/**
 * Control value valid in editor.
 */
addFilter( 'lzb.editor.control.select.isValueValid', 'lzb.editor', ( isValid, value, data ) => {
    if ( 'true' === data.allow_null ) {
        isValid = true;
    }

    return isValid;
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.select.settings', 'lzb.constructor', ( render, props ) => {
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
                    label={ __( 'Allow Null', '@@text_domain' ) }
                    help={ __( 'Allows you to reset selected option value to null', '@@text_domain' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes', '@@text_domain' ) }
                        checked={ 'true' === data.allow_null }
                        onChange={ ( value ) => updateData( { allow_null: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Multiple', '@@text_domain' ) }
                    help={ __( 'Allows you to select multiple values', '@@text_domain' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes', '@@text_domain' ) }
                        checked={ 'true' === data.multiple }
                        onChange={ ( value ) => updateData( { multiple: value ? 'true' : 'false' } ) }
                    />
                </BaseControl>
            </PanelBody>
            <PanelBody>
                <BaseControl
                    label={ __( 'Output Format', '@@text_domain' ) }
                    help={ __( 'Allows you to change attribute output format', '@@text_domain' ) }
                >
                    <RadioControl
                        options={ [
                            {
                                label: __( 'Value', '@@text_domain' ),
                                value: '',
                            }, {
                                label: __( 'Label', '@@text_domain' ),
                                value: 'label',
                            }, {
                                label: __( 'Both (Array)', '@@text_domain' ),
                                value: 'array',
                            },
                        ] }
                        selected={ data.output_format || '' }
                        onChange={ ( value ) => updateData( { output_format: value } ) }
                    />
                </BaseControl>
            </PanelBody>
        </Fragment>
    );
} );
