import CreatableSelect from 'react-select/lib/Creatable';
import ReactSelect from 'react-select';

// Import CSS
import './editor.scss';

const { Component } = wp.element;

export default class Select extends Component {
    render() {
        const ThisSelect = this.props.isCreatable ? CreatableSelect : ReactSelect;

        return (
            <ThisSelect
                className="lazyblocks-component-select"
                styles={ {
                    control: ( styles ) => {
                        return {
                            ...styles,
                            'min-height': 32,
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
