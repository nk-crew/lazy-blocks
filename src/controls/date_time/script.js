/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

const { Component } = wp.element;

const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    __experimentalGetSettings: getSettings,
    dateI18n,
} = wp.date;

const {
    Dropdown,
    PanelBody,
    BaseControl,
    ButtonGroup,
    Button,
    DatePicker,
    TimePicker,
} = wp.components;

/**
 * Date Time Picker.
 */
class DateTimePicker extends Component {
    render() {
        const {
            value,
            onChange,
            label,
            help,
            allowTimePicker = true,
            allowDatePicker = true,
        } = this.props;

        const settings = getSettings();

        // To know if the current timezone is a 12 hour time with look for an "a" in the time format.
        // We also make sure this a is not escaped by a "/".
        const is12Hour = /a(?!\\)/i.test(
            settings.formats.time
                .toLowerCase() // Test only the lower case a
                .replace( /\\\\/g, '' ) // Replace "//" with empty strings
                .split( '' ).reverse()
                .join( '' ) // Reverse the string and test for "a" not followed by a slash
        );

        let buttonLabel = __( 'Select Date', '@@text_domain' );
        let resolvedFormat = settings.formats.date || 'F j, Y';

        if ( allowTimePicker && allowDatePicker ) {
            buttonLabel = __( 'Select Date and Time', '@@text_domain' );
            resolvedFormat = settings.formats.datetime || 'F j, Y g:i a';
        } else if ( allowTimePicker ) {
            buttonLabel = __( 'Select Time', '@@text_domain' );
            resolvedFormat = settings.formats.time || 'g:i a';
        }

        return (
            <BaseControl
                label={ label }
                help={ help }
            >
                <div>
                    <Dropdown
                        renderToggle={ ( { isOpen, onToggle } ) => (
                            <Button
                                isSecondary
                                isSmall
                                aria-expanded={ isOpen }
                                onClick={ onToggle }
                            >
                                { value ? dateI18n( resolvedFormat, value ) : buttonLabel }
                            </Button>
                        ) }
                        renderContent={ () => (
                            <div
                                className={
                                    classnames(
                                        'components-datetime',
                                        'lzb-gutenberg-date-time-picker',
                                        allowTimePicker ? 'lzb-gutenberg-date-time-picker-allowed-time' : '',
                                        allowDatePicker ? 'lzb-gutenberg-date-time-picker-allowed-date' : ''
                                    )
                                }
                            >
                                <TimePicker
                                    currentTime={ value }
                                    onChange={ onChange }
                                    is12Hour={ is12Hour }
                                />
                                { allowDatePicker ? (
                                    <DatePicker
                                        currentDate={ value }
                                        onChange={ onChange }
                                    />
                                ) : '' }
                            </div>
                        ) }
                    />
                </div>
            </BaseControl>
        );
    }
}

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.date_time.render', 'lzb.editor', ( render, props ) => {
    const {
        label,
        help,
        date_time_picker: dateTimePicker,
    } = props.data;

    return (
        <DateTimePicker
            label={ label }
            help={ help }
            allowTimePicker={ /time/.test( dateTimePicker ) }
            allowDatePicker={ /date/.test( dateTimePicker ) }
            value={ props.getValue() }
            onChange={ props.onChange }
        />
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
                    isSmall
                    isPrimary={ /date/.test( dateTimePicker ) }
                    isPressed={ /date/.test( dateTimePicker ) }
                    onClick={ () => {
                        let result = 'date';

                        if ( 'date_time' === dateTimePicker ) {
                            result = 'time';
                        } else if ( 'date' === dateTimePicker ) {
                            result = 'date';
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
                    isSmall
                    isPrimary={ /time/.test( dateTimePicker ) }
                    isPressed={ /time/.test( dateTimePicker ) }
                    onClick={ () => {
                        let result = 'time';

                        if ( 'date_time' === dateTimePicker ) {
                            result = 'date';
                        } else if ( 'time' === dateTimePicker ) {
                            result = 'time';
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
