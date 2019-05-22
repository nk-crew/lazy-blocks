import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component } = wp.element;

export default class TypeRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            type = '',
        } = data;

        const types = [
            // Basic.
            {
                value: 'text',
                label: __( 'Text' ),
                group: __( 'Basic' ),
            }, {
                value: 'textarea',
                label: __( 'Text Area' ),
                group: __( 'Basic' ),
            }, {
                value: 'number',
                label: __( 'Number' ),
                group: __( 'Basic' ),
            }, {
                value: 'range',
                label: __( 'Range' ),
                group: __( 'Basic' ),
            }, {
                value: 'url',
                label: __( 'URL' ),
                group: __( 'Basic' ),
            }, {
                value: 'email',
                label: __( 'Email' ),
                group: __( 'Basic' ),
            }, {
                value: 'password',
                label: __( 'Password' ),
                group: __( 'Basic' ),
            },

            // Content.
            {
                value: 'image',
                label: __( 'Image' ),
                group: __( 'Content' ),
            }, {
                value: 'gallery',
                label: __( 'Gallery' ),
                group: __( 'Content' ),
            }, {
                value: 'rich_text',
                label: __( 'Rich Text (WYSIWYG)' ),
                group: __( 'Content' ),
            }, {
                value: 'code_editor',
                label: __( 'Code Editor' ),
                group: __( 'Content' ),
            }, {
                value: 'inner_blocks',
                label: __( 'Inner Blocks' ),
                group: __( 'Content' ),
                isDisabled: data.child_of,
            },

            // Choice.
            {
                value: 'select',
                label: __( 'Select' ),
                group: __( 'Choice' ),
            }, {
                value: 'radio',
                label: __( 'Radio' ),
                group: __( 'Choice' ),
            }, {
                value: 'checkbox',
                label: __( 'Checkbox' ),
                group: __( 'Choice' ),
            }, {
                value: 'toggle',
                label: __( 'Toggle' ),
                group: __( 'Choice' ),
            },

            // Advanced.
            {
                value: 'color',
                label: __( 'Color Picker' ),
                group: __( 'Advanced' ),
            }, {
                value: 'date_time',
                label: __( 'Date Time Picker' ),
                group: __( 'Advanced' ),
            },

            // Layout.
            {
                value: 'repeater',
                label: __( 'Repeater' ),
                group: __( 'Layout' ),
                isDisabled: data.child_of,
            },
        ];

        // prepare options list to react-select.
        const groupedTypes = {};
        const reactSelectTypes = [];

        types.forEach( ( option ) => {
            if ( option.group ) {
                groupedTypes[ option.group ] = {
                    label: option.group,
                    options: [
                        ...( groupedTypes[ option.group ] && groupedTypes[ option.group ].options ? groupedTypes[ option.group ].options : [] ),
                        ...[ option ],
                    ],
                };
            } else {
                reactSelectTypes.push( option );
            }
        } );

        Object.keys( groupedTypes ).forEach( ( k ) => {
            reactSelectTypes.push( groupedTypes[ k ] );
        } );

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Type' ) }</span>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <Select
                        value={ types.filter( option => option.value === type ) }
                        options={ reactSelectTypes }
                        onChange={ ( { value } ) => updateData( { type: value } ) }
                    />
                </div>
            </div>
        );
    }
}
