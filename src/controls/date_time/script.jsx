const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    DatePicker,
    TimePicker,
    ButtonGroup,
    Button,
} = wp.components;

const getDateSettings = wp.date.__experimentalGetSettings;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.date_time.render', 'lzb.editor', ( render, props ) => {
    const settings = getDateSettings();

    // To know if the current timezone is a 12 hour time with look for "a" in the time format.
    // We also make sure this a is not escaped by a "/".
    const is12HourTime = /a(?!\\)/i.test(
        settings.formats.time
            .toLowerCase() // Test only the lower case a
            .replace( /\\\\/g, '' ) // Replace "//" with empty strings
            .split( '' ).reverse().join( '' ) // Reverse the string and test for "a" not followed by a slash
    );

    return (
        <BaseControl
            label={ props.data.label }
            help={ props.data.help }
        >
            { /date/.test( props.data.date_time_picker ) ? (
                <DatePicker
                    locale={ settings.l10n.locale }
                    currentDate={ props.getValue() }
                    onChange={ props.onChange }
                />
            ) : '' }
            { /time/.test( props.data.date_time_picker ) ? (
                <TimePicker
                    is12Hour={ is12HourTime }
                    currentTime={ props.getValue() }
                    onChange={ props.onChange }
                />
            ) : '' }
        </BaseControl>
    );
} );

/**
 * Control settings render in constructor.
 */
addFilter( 'lzb.constructor.control.date_time.settings', 'lzb.constructor', ( render, props ) => {
    const {
        updateData,
        data,
    } = props;

    const {
        date_time_picker: dateTimePicker,
    } = data;

    return (
        <PanelBody>
            <ButtonGroup>
                <Button
                    isDefault
                    isPrimary={ /date/.test( dateTimePicker ) }
                    onClick={ () => {
                        let result = 'date';

                        if ( 'date_time' === dateTimePicker ) {
                            result = 'time';
                        } else if ( 'date' === dateTimePicker ) {
                            result = '';
                        } else if ( 'time' === dateTimePicker ) {
                            result = 'date_time';
                        }

                        updateData( {
                            date_time_picker: result,
                        } );
                    } }
                >
                    { __( 'Date', '@@text_domain' ) }
                </Button>
                <Button
                    isDefault
                    isPrimary={ /time/.test( dateTimePicker ) }
                    onClick={ () => {
                        let result = 'time';

                        if ( 'date_time' === dateTimePicker ) {
                            result = 'date';
                        } else if ( 'time' === dateTimePicker ) {
                            result = '';
                        } else if ( 'date' === dateTimePicker ) {
                            result = 'date_time';
                        }

                        updateData( {
                            date_time_picker: result,
                        } );
                    } }
                >
                    { __( 'Time', '@@text_domain' ) }
                </Button>
            </ButtonGroup>
        </PanelBody>
    );
} );
