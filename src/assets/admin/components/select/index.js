/* eslint-disable indent */
import CreatableSelect from 'react-select/creatable';
import AsyncSelect from 'react-select/async';
import ReactSelect from 'react-select';
import selectStyles from 'gutenberg-react-select-styles';

// Import CSS
import './editor.scss';

export default function Select(props) {
  let ThisSelect = ReactSelect;

  if (props.isAsync) {
    ThisSelect = AsyncSelect;
  } else if (props.isCreatable) {
    ThisSelect = CreatableSelect;
  }

  return (
    <ThisSelect
      menuPlacement="auto"
      className="lazyblocks-component-select"
      styles={selectStyles}
      {...{
        ...props,
        ...(props.isTags
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
