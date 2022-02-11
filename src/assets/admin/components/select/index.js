/* eslint-disable indent */
import CreatableSelect from 'react-select/creatable';
import AsyncSelect from 'react-select/async';
import ReactSelect from 'react-select';
import selectStyles from 'gutenberg-react-select-styles';

// Import CSS
import './editor.scss';

const { Component } = wp.element;

export default class Select extends Component {
  render() {
    let ThisSelect = ReactSelect;

    if (this.props.isAsync) {
      ThisSelect = AsyncSelect;
    } else if (this.props.isCreatable) {
      ThisSelect = CreatableSelect;
    }

    return (
      <ThisSelect
        menuPlacement="auto"
        className="lazyblocks-component-select"
        styles={selectStyles}
        {...{
          ...this.props,
          ...(this.props.isTags
            ? {
                isMulti: true,
                components: {
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                  ClearIndicator: () => null,
                  Menu: () => null,
                },
              }
            : {}),
        }}
      />
    );
  }
}
