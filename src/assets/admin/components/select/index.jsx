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
                    control: ( styles, props ) => {
                        return {
                            ...styles,
                            minHeight: 32,
                            borderColor: props.isFocused ? '#007cba' : '#7e8993',
                            boxShadow: props.isFocused ? '0 0 0 1px #007cba' : '',
                            ':hover': {
                                borderColor: props.isFocused ? '#007cba' : '#7e8993',
                            },
                        };
                    },
                    input: ( styles ) => {
                        return {
                            ...styles,
                            margin: 0,
                        };
                    },
                    dropdownIndicator: ( styles ) => {
                        return {
                            ...styles,
                            padding: 5,
                        };
                    },
                    clearIndicator: ( styles ) => {
                        return {
                            ...styles,
                            padding: 5,
                        };
                    },
                    multiValue: ( styles ) => {
                        return {
                            ...styles,
                        };
                    },
                    multiValueLabel: ( styles ) => {
                        return {
                            ...styles,
                            padding: 0,
                        };
                    },
                    multiValueRemove: ( styles ) => {
                        return {
                            ...styles,
                            padding: 0,
                        };
                    },
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
