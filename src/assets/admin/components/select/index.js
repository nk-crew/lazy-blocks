import CreatableSelect from 'react-select/creatable';
import ReactSelect from 'react-select';
import selectStyles from 'gutenberg-react-select-styles';

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
                styles={ selectStyles }
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
