const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    TextControl,
    CheckboxControl,
} = wp.components;

export default class RepeaterRows extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        return (
            <Fragment>
                <TextControl
                    label={ __( 'Row Label' ) }
                    placeholder={ __( 'Row {{#}}' ) }
                    help={ __( 'Example: "My row number {{#}} with inner control {{control_name}}"' ) }
                    value={ data.rows_label }
                    onChange={ ( value ) => updateData( { rows_label: value } ) }
                />
                <TextControl
                    label={ __( 'Add Button Label' ) }
                    placeholder={ __( '+ Add Row' ) }
                    value={ data.rows_add_button_label }
                    onChange={ ( value ) => updateData( { rows_add_button_label: value } ) }
                />
                <TextControl
                    type="number"
                    label={ __( 'Minimum Rows' ) }
                    placeholder={ 0 }
                    min={ 0 }
                    value={ data.rows_min }
                    onChange={ ( value ) => updateData( { rows_min: value } ) }
                />
                <TextControl
                    type="number"
                    label={ __( 'Maximum Rows' ) }
                    placeholder={ 0 }
                    min={ 0 }
                    value={ data.rows_max }
                    onChange={ ( value ) => updateData( { rows_max: value } ) }
                />
                <BaseControl
                    label={ __( 'Collapsible Rows' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ 'true' === data.rows_collapsible }
                        onChange={ ( value ) => updateData( { rows_collapsible: value ? 'true' : 'false' } ) }
                    />
                    { 'true' === data.rows_collapsible ? (
                        <CheckboxControl
                            label={ __( 'Collapsed by Default' ) }
                            checked={ 'true' === data.rows_collapsed }
                            onChange={ ( value ) => updateData( { rows_collapsed: value ? 'true' : 'false' } ) }
                        />
                    ) : '' }
                </BaseControl>
            </Fragment>
        );
    }
}
