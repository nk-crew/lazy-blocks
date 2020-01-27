import Select from '../../assets/admin/components/select';

const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    BaseControl,
    DatePicker,
    TimePicker,
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
                    value={ props.getValue() }
                    onChange={ props.onChange }
                />
            ) : '' }
            { /time/.test( props.data.date_time_picker ) ? (
                <TimePicker
                    is12Hour={ is12HourTime }
                    value={ props.getValue() }
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

    const options = [
        {
            value: 'date_time',
            label: __( 'Date + Time', '@@text_domain' ),
        }, {
            value: 'date',
            label: __( 'Date', '@@text_domain' ),
        }, {
            value: 'time',
            label: __( 'Time', '@@text_domain' ),
        },
    ];

    return (
        <PanelBody>
            <Select
                label={ __( 'Picker', '@@text_domain' ) }
                value={ options.filter( option => option.value === data.date_time_picker ) }
                options={ options }
                onChange={ ( { value } ) => updateData( { date_time_picker: value } ) }
            />
        </PanelBody>
    );
} );
