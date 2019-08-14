import Select from '../../../../components/select';

const { __ } = wp.i18n;
const { Component } = wp.element;
const { BaseControl } = wp.components;

export default class PlacementRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            placement = 'content',
        } = data;

        let options = [
            {
                value: 'content',
                label: __( 'Content' ),
            }, {
                value: 'inspector',
                label: __( 'Inspector' ),
            }, {
                value: 'both',
                label: __( 'Both' ),
            }, {
                value: 'nowhere',
                label: __( 'Hidden' ),
            },
        ];

        if ( 'inner_blocks' === data.type ) {
            options = [
                {
                    value: 'content',
                    label: __( 'Content' ),
                },
            ];
        }

        return (
            <BaseControl
                label={ __( 'Placement' ) }
            >
                <Select
                    value={ options.filter( option => option.value === placement ) }
                    options={ options }
                    onChange={ ( { value } ) => updateData( { placement: value } ) }
                    isDisabled={ 'inner_blocks' === data.type }
                />
            </BaseControl>
        );
    }
}
