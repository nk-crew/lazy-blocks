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
    PanelBody,
    BaseControl,
    ButtonGroup,
    Button,
    Popover,
    DatePicker,
    TimePicker,
} = wp.components;

/**
 * Date Time Picker.
 */
class DateTimePicker extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            isPickerOpen: false,
        };
    }

    render() {
        const {
            value,
            onChange,
            label,
            help,
            allowTimePicker = true,
            allowDatePicker = true,
        } = this.props;

        const {
            isPickerOpen,
        } = this.state;

        const settings = getSettings();
        const resolvedFormat = settings.formats.datetime || 'F j, Y g:i a';

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

        if ( allowTimePicker && allowDatePicker ) {
            buttonLabel = __( 'Select Date and Time', '@@text_domain' );
        } else if ( allowTimePicker ) {
            buttonLabel = __( 'Select Time', '@@text_domain' );
        }

        return (
            <BaseControl
                label={ label }
                help={ help }
            >
                <div>
                    <Button
                        isSecondary
                        isSmall
                        onClick={ () => this.setState( { isPickerOpen: ! isPickerOpen } ) }
                    >
                        { value ? dateI18n( resolvedFormat, value ) : buttonLabel }
                    </Button>
                    { isPickerOpen ? (
                        <Popover
                            onClose={ () => this.setState( { isPickerOpen: false } ) }
                        >
                            <div className="components-datetime">
                                { allowTimePicker ? (
                                    <TimePicker
                                        currentTime={ value }
                                        onChange={ onChange }
                                        is12Hour={ is12Hour }
                                    />
                                ) : '' }
                                { allowDatePicker ? (
                                    <DatePicker
                                        currentDate={ value }
                                        onChange={ onChange }
                                    />
                                ) : '' }
                            </div>
                        </Popover>
                    ) : '' }
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
