// Import CSS
import './editor.scss';

import iconsList from './icons.jsx';

const { Component } = wp.element;
const { __ } = wp.i18n;
const {
    BaseControl,
    TextControl,
    Dropdown,
} = wp.components;

export default class IconPicker extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            search: '',
        };
    }
    render() {
        let previewClass = this.props.value || '';

        if ( previewClass.indexOf( 'dashicons' ) !== -1 ) {
            previewClass = 'dashicons ' + previewClass;
        }
        previewClass = `lazyblocks-component-icon-picker-preview ${ previewClass }`;

        return (
            <BaseControl
                label={ this.props.label || '' }
            >
                <div className="lazyblocks-component-icon-picker">
                    <TextControl
                        { ...{
                            ...this.props,
                            ...{ label: '' },
                        } }
                    />
                    <Dropdown
                        renderToggle={ ( { isOpen, onToggle } ) => (
                            <button
                                className="lazyblocks-component-icon-picker-btn button button-large"
                                aria-expanded={ isOpen }
                                onClick={ onToggle }
                            >
                                <span className={ previewClass } />
                                { __( 'Choose' ) }
                            </button>
                        ) }
                        renderContent={ () => {
                            const result = [];

                            iconsList.forEach( ( className, i ) => {
                                let allowIcon = true;

                                if ( this.state.search ) {
                                    allowIcon = className.indexOf( this.state.search ) >= 0;
                                }

                                if ( allowIcon ) {
                                    result.push(
                                        <button
                                            key={ `icon-${ i }` }
                                            className={ `lazyblocks-component-icon-picker-icon ${ className === this.props.value ? 'lazyblocks-component-icon-picker-icon-active' : '' }` }
                                            onClick={ () => {
                                                this.props.onChange( className );
                                            } }
                                        >
                                            <span className={ `dashicons ${ className }` }></span>
                                        </button>
                                    );
                                }
                            } );

                            return (
                                <div className="lazyblocks-component-icon-picker-list">
                                    <div>
                                        <TextControl
                                            label={ __( 'Search icon' ) }
                                            value={ this.state.search }
                                            onChange={ ( searchVal ) => this.setState( { search: searchVal } ) }
                                            placeholder={ __( 'Type to search...' ) }
                                        />
                                    </div>
                                    <div className="lazyblocks-component-icon-picker-list-wrap">
                                        { result }
                                    </div>
                                </div>
                            );
                        } }
                    />
                </div>
            </BaseControl>
        );
    }
}
