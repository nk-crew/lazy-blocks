const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    TextControl,
} = wp.components;

export default class NameRow extends Component {
    render() {
        const {
            updateData,
            data,
        } = this.props;

        const {
            name = '',
        } = data;

        // // slug validation
        // if ( ! /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( `lazyblock/${ slugVal }` ) ) {
        //     e.preventDefault();

        //     if ( ! $slugInput.parent().next( '.notice' ).length ) {
        //         $slugInput.parent().after( `<div class="notice error"><p>${ 'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block' }</p></div>` );
        //     }
        // }

        return (
            <div className="lzb-constructor-controls-item-settings-row">
                <div className="lzb-constructor-controls-item-settings-row-label">
                    <span>{ __( 'Name' ) }</span>
                    <small>{ __( 'Unique control name, no spaces. Underscores and dashes allowed' ) }</small>
                </div>
                <div className="lzb-constructor-controls-item-settings-row-control">
                    <TextControl
                        value={ name }
                        onChange={ ( value ) => updateData( { name: value } ) }
                    />
                </div>
            </div>
        );
    }
}
