// eslint-disable-next-line import/no-unresolved
import CreatableSelect from 'react-select/Creatable';
import ReactSelect from 'react-select';

// Import CSS
import './editor.scss';

const { Component } = wp.element;

export default class Select extends Component {
    render() {
        const ThisSelect = this.props.isCreatable ? CreatableSelect : ReactSelect;

        return (
            <ThisSelect
                menuPlacement="auto"
                className="lazyblocks-component-select"
                styles={ {
                    menu: ( styles ) => ( {
                        ...styles,
                        zIndex: 2,
                    } ),
                    control: ( styles, props ) => ( {
                        ...styles,
                        minHeight: 32,
                        borderColor: props.isFocused ? '#007cba' : '#7e8993',
                        boxShadow: props.isFocused ? '0 0 0 1px #007cba' : '',
                        ':hover': {
                            borderColor: props.isFocused ? '#007cba' : '#7e8993',
                        },
                    } ),
                    input: ( styles ) => ( {
                        ...styles,
                        margin: 0,
                    } ),
                    dropdownIndicator: ( styles ) => ( {
                        ...styles,
                        padding: 5,
                    } ),
                    clearIndicator: ( styles ) => ( {
                        ...styles,
                        padding: 5,
                    } ),
                    multiValue: ( styles ) => ( {
                        ...styles,
                    } ),
                    multiValueLabel: ( styles ) => ( {
                        ...styles,
                        padding: 0,
                    } ),
                    multiValueRemove: ( styles ) => ( {
                        ...styles,
                        padding: 0,
                    } ),
                } }
                { ...{
                    ...this.props,
                    ...( this.props.isTags ? {
                        isMulti: true,
                        components: {
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                            ClearIndicator: () => null,
                            Menu: () => null,
                        },
                    } : {} ),
                } }
            />
        );
    }
}
