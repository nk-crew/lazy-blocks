import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    Notice,
    BaseControl,
    ToggleControl,
    Disabled,
} = wp.components;

export default class SupportsSettings extends Component {
    render() {
        const {
            data,
            updateData,
        } = this.props;

        const {
            supports_multiple: supportsMultiple,
            supports_classname: supportsClassname,
            supports_anchor: supportsAnchor,
            supports_inserter: supportsInserter,
            supports_align: supportsAlign,

            supports_ghostkit_spacings: supportsGktSpacings,
            supports_ghostkit_display: supportsGktDisplay,
            supports_ghostkit_scroll_reveal: supportsGktScrollReveal,
        } = data;

        let GktWrap = 'div';

        if ( ! window.GHOSTKIT ) {
            GktWrap = Disabled;
        }

        return (
            <Fragment>
                <ToggleControl
                    label={ __( 'Multiple' ) }
                    help={ __( 'Allow use block multiple times on the page.' ) }
                    checked={ supportsMultiple }
                    onChange={ ( value ) => updateData( { supports_multiple: value } ) }
                />
                <ToggleControl
                    label={ __( 'Class Name' ) }
                    help={ __( 'Additional field to add custom class name.' ) }
                    checked={ supportsClassname }
                    onChange={ ( value ) => updateData( { supports_classname: value } ) }
                />
                <ToggleControl
                    label={ __( 'Anchor' ) }
                    help={ __( 'Additional field to add block ID attribute.' ) }
                    checked={ supportsAnchor }
                    onChange={ ( value ) => updateData( { supports_anchor: value } ) }
                />
                <ToggleControl
                    label={ __( 'Inserter' ) }
                    help={ __( 'Show block in blocks inserter.' ) }
                    checked={ supportsInserter }
                    onChange={ ( value ) => updateData( { supports_inserter: value } ) }
                />
                <BaseControl
                    label={ __( 'Align' ) }
                >
                    <Select
                        isMulti
                        placeholder={ __( 'Select align options' ) }
                        options={
                            [ 'wide', 'full', 'left', 'center', 'right' ].map( ( alignName ) => {
                                return {
                                    value: alignName,
                                    label: alignName,
                                };
                            } )
                        }
                        value={ ( () => {
                            if ( supportsAlign && supportsAlign.length ) {
                                const result = supportsAlign
                                    .filter( ( val ) => {
                                        return val !== 'none';
                                    } )
                                    .map( ( val ) => {
                                        return {
                                            value: val,
                                            label: val,
                                        };
                                    } );
                                return result;
                            }
                            return [];
                        } )() }
                        onChange={ ( value ) => {
                            if ( value ) {
                                const result = [];

                                value.forEach( ( optionData ) => {
                                    result.push( optionData.value );
                                } );

                                updateData( { supports_align: result } );
                            } else {
                                updateData( { supports_align: [ 'none' ] } );
                            }
                        } }
                    />
                </BaseControl>
                <h3>{ __( 'GhostKit Extensions' ) }</h3>
                { ! window.GHOSTKIT ? (
                    <BaseControl>
                        <Notice isDismissible={ false }>
                            <p>
                                { __( 'Install GhostKit plugin to use the following settings.' ) }
                            </p>
                            <a
                                className="components-button is-button is-default is-small"
                                href="https://wordpress.org/plugins/ghostkit/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                { __( 'Install' ) }
                            </a>
                        </Notice>
                    </BaseControl>
                ) : '' }
                { window.GHOSTKIT && ( supportsGktSpacings || supportsGktDisplay ) && ! supportsClassname ? (
                    <BaseControl>
                        <Notice isDismissible={ false } status="error">
                            <p>
                                { __( 'To use these extensions required "Class Name" support.' ) }
                            </p>
                        </Notice>
                    </BaseControl>
                ) : '' }
                <GktWrap>
                    <ToggleControl
                        label={ __( 'Spacings' ) }
                        help={ __( 'Change block margins and paddings.' ) }
                        checked={ supportsGktSpacings }
                        onChange={ ( value ) => updateData( { supports_ghostkit_spacings: value } ) }
                    />
                    <ToggleControl
                        label={ __( 'Display' ) }
                        help={ __( 'Display / Hide blocks on different screen sizes.' ) }
                        checked={ supportsGktDisplay }
                        onChange={ ( value ) => updateData( { supports_ghostkit_display: value } ) }
                    />
                    <ToggleControl
                        label={ __( 'Animate on Scroll' ) }
                        help={ __( 'Display block with animation on scroll.' ) }
                        checked={ supportsGktScrollReveal }
                        onChange={ ( value ) => updateData( { supports_ghostkit_scroll_reveal: value } ) }
                    />
                </GktWrap>
            </Fragment>
        );
    }
}
