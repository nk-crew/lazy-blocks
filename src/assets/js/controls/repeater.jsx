const { __ } = wp.i18n;
const { Component } = wp.element;
const {
    BaseControl,
    Button,
} = wp.components;

const {
    withInstanceId,
} = wp.compose;

class RepeaterControl extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            activeItem: -1,
        };
    }
    render() {
        const {
            label,
            count = 1,
            renderRow = () => {},
            addRow = () => {},
            removeRow = () => {},
        } = this.props;

        const items = [];
        for ( let i = 0; i < count; i++ ) {
            const active = this.state.activeItem === i;

            items.push(
                <div className="lzb-gutenberg-repeater-item" key={ i }>
                    <button
                        className={ 'lzb-gutenberg-repeater-btn' + ( active ? ' lzb-gutenberg-repeater-btn-active' : '' ) }
                        onClick={ ( e ) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if ( this.state.activeItem === i ) {
                                this.setState( { activeItem: -1 } );
                            } else {
                                this.setState( { activeItem: i } );
                            }
                        } }
                    >
                        { `Row ${ i + 1 }` }
                        <span className="lzb-gutenberg-repeater-btn-arrow dashicons dashicons-arrow-right-alt2" />
                    </button>
                    <button className="lzb-gutenberg-repeater-btn-remove" onClick={ ( e ) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeRow( i );
                    } }><span className="dashicons dashicons-no-alt" /></button>
                    { active ? renderRow( i ) : '' }
                </div>
            );
        }

        return (
            <BaseControl label={ label }>
                <div className="lzb-gutenberg-repeater">
                    { items.length && items.length > 0 ? (
                        <div className="lzb-gutenberg-repeater-items">
                            { items }
                        </div>
                    ) : '' }
                    <Button
                        isDefault={ true }
                        onClick={ () => {
                            addRow();
                        } }
                    >
                        { __( '+ Add Row' ) }
                    </Button>
                </div>
            </BaseControl>
        );
    }
}

export default withInstanceId( RepeaterControl );
