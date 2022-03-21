import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

const { __ } = wp.i18n;
const { useRef } = wp.element;
const { BaseControl, TextControl, Button } = wp.components;

const DragHandle = SortableHandle(() => (
  <div className="lzb-constructor-controls-item-settings-choices-item-handler">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4.99976H8V6.99976H10V4.99976Z" fill="currentColor" />
      <path d="M10 10.9998H8V12.9998H10V10.9998Z" fill="currentColor" />
      <path d="M10 16.9998H8V18.9998H10V16.9998Z" fill="currentColor" />
      <path d="M16 4.99976H14V6.99976H16V4.99976Z" fill="currentColor" />
      <path d="M16 10.9998H14V12.9998H16V10.9998Z" fill="currentColor" />
      <path d="M16 16.9998H14V18.9998H16V16.9998Z" fill="currentColor" />
    </svg>
  </div>
));

const SortableItem = SortableElement((data) => (
  <div className="lzb-constructor-controls-item-settings-choices-item">
    <TextControl
      placeholder={__('Label', '@@text_domain')}
      value={data.label}
      onChange={(value) => data.updateChoice({ label: value })}
    />
    <TextControl
      placeholder={__('Value', '@@text_domain')}
      value={data.value}
      onChange={(value) => data.updateChoice({ value })}
    />
    <DragHandle />
    {/* eslint-disable-next-line react/button-has-type */}
    <button
      className="lzb-constructor-controls-item-settings-choices-item-remove"
      onClick={() => data.removeChoice()}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.33734 7.1706C6.23299 6.4793 6.76826 5.85717 7.4674 5.85717H16.5326C17.2317 5.85717 17.767 6.4793 17.6627 7.17061L15.9807 18.3134C15.8963 18.8724 15.416 19.2857 14.8507 19.2857H9.14934C8.58403 19.2857 8.10365 18.8724 8.01928 18.3134L6.33734 7.1706Z"
          stroke="currentColor"
          strokeWidth="1.71429"
        />
        <rect x="4" y="5" width="16" height="2" fill="currentColor" />
        <path
          d="M14.2857 5C14.2857 5 13.2624 5 12 5C10.7376 5 9.71428 5 9.71428 5C9.71428 3.73763 10.7376 2.71429 12 2.71429C13.2624 2.71429 14.2857 3.73763 14.2857 5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  </div>
));
const SortableList = SortableContainer(({ items }) => (
  <div className="lzb-constructor-controls-item-settings-choices-items">
    {items.map((value, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <SortableItem
        // eslint-disable-next-line react/no-array-index-key
        key={`lzb-constructor-controls-item-settings-choices-item-${index}`}
        index={index}
        {...value}
      />
    ))}
  </div>
));

export default function ChoicesRow(props) {
  const { data, updateData } = props;
  const { choices = [] } = data;

  const $sortRef = useRef();

  function addChoice() {
    choices.push({
      label: '',
      value: '',
    });

    updateData({ choices });
  }

  function removeChoice(i) {
    choices.splice(i, 1);

    updateData({ choices });
  }

  function updateChoice(i, newData) {
    if (choices[i]) {
      choices[i] = {
        ...choices[i],
        ...newData,
      };

      updateData({ choices });
    }
  }

  function resortChoice(oldIndex, newIndex) {
    const newChoices = arrayMoveImmutable(choices, oldIndex, newIndex);

    updateData({ choices: newChoices });
  }

  const items = [];

  if (choices && choices.length) {
    choices.forEach((choice, i) => {
      items.push({
        value: choice.value,
        label: choice.label,
        removeChoice() {
          removeChoice(i);
        },
        updateChoice(newData) {
          updateChoice(i, newData);
        },
      });
    });
  }

  return (
    <BaseControl label={__('Choices', '@@text_domain')}>
      <div className="lzb-constructor-controls-item-settings-choices">
        {items.length ? (
          <SortableList
            ref={$sortRef}
            items={items}
            onSortEnd={({ oldIndex, newIndex }) => {
              resortChoice(oldIndex, newIndex);
            }}
            useDragHandle
            helperContainer={() => {
              if ($sortRef && $sortRef.current && $sortRef.current.container) {
                return $sortRef.current.container;
              }

              return document.body;
            }}
          />
        ) : (
          ''
        )}
        <div>
          <Button onClick={() => addChoice()} isSecondary isSmall>
            {__('+ Add Choice', '@@text_domain')}
          </Button>
        </div>
      </div>
    </BaseControl>
  );
}
