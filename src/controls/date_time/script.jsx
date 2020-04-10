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
    DateTimePicker: WPDateTimePicker,
} = wp.components;

/**
 * Date Time Picker.
 */
class DateTimePicker extends Component {
    constructor() {
        super( ...arguments );

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
            is12Hour = false,
        } = this.props;

        const {
            isPickerOpen,
        } = this.state;

        const settings = getSettings();
        const resolvedFormat = settings.formats.datetime || 'F j, Y g:i a';

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
                        { value ? dateI18n( resolvedFormat, value ) : __( 'Select Date', '@@text_domain' ) }
                    </Button>
                    { isPickerOpen ? (
                        <Popover
                            onClose={ () => this.setState( { isPickerOpen: false } ) }
                        >
                            <WPDateTimePicker
                                label={ label }
                                currentDate={ value }
                                onChange={ onChange }
                                is12Hour={ is12Hour }
                            />
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
    return (
        <DateTimePicker
            label={ props.data.label }
            help={ props.data.help }
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
                    isSecondary
                    isSmall
                    isPrimary={ /date/.test( dateTimePicker ) }
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
                    isSecondary
                    isSmall
                    isPrimary={ /time/.test( dateTimePicker ) }
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
