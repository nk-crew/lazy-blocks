import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component } = wp.element;

export default class DateTimePickerRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const options = [
            {
                value: 'date_time',
                label: __( 'Date + Time' ),
            }, {
                value: 'date',
                label: __( 'Date' ),
            }, {
                value: 'time',
                label: __( 'Time' ),
            },
        ];

        return (
            <Select
                label={ __( 'Picker' ) }
                value={ options.filter( option => option.value === data.date_time_picker ) }
                options={ options }
                onChange={ ( { value } ) => updateData( { date_time_picker: value } ) }
            />
        );
    }
}
