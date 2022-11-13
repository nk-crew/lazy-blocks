import classnames from 'classnames/dedupe';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMoveImmutable } from 'array-move';

const { __ } = wp.i18n;

const { BaseControl, TextControl, Button } = wp.components;

const { usePrevious } = wp.compose;

const SortableItem = function (props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } =
    useSortable({
      id: props.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isSorting ? transition : '',
  };

  return (
    <div
      className={classnames(
        'lzb-constructor-controls-item-settings-choices-item',
        isDragging ? 'lzb-constructor-controls-item-settings-choices-item-dragging' : ''
      )}
      ref={setNodeRef}
      style={style}
    >
      <TextControl
        placeholder={__('Label', 'lazy-blocks')}
        value={props.label}
        onChange={(value) => props.updateChoice({ label: value })}
        autoFocus={props.focusInput}
      />
      <TextControl
        placeholder={__('Value', 'lazy-blocks')}
        value={props.value}
        onChange={(value) => props.updateChoice({ value })}
      />
      <div
        className="lzb-constructor-controls-item-settings-choices-item-handler"
        {...attributes}
        {...listeners}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 4.99976H8V6.99976H10V4.99976Z" fill="currentColor" />
          <path d="M10 10.9998H8V12.9998H10V10.9998Z" fill="currentColor" />
          <path d="M10 16.9998H8V18.9998H10V16.9998Z" fill="currentColor" />
          <path d="M16 4.99976H14V6.99976H16V4.99976Z" fill="currentColor" />
          <path d="M16 10.9998H14V12.9998H16V10.9998Z" fill="currentColor" />
          <path d="M16 16.9998H14V18.9998H16V16.9998Z" fill="currentColor" />
        </svg>
      </div>
      {/* eslint-disable-next-line react/button-has-type */}
      <button
        className="lzb-constructor-controls-item-settings-choices-item-remove"
        onClick={() => props.removeChoice()}
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
  );
};

export default function ChoicesRow(props) {
  const { data, updateData } = props;
  const { choices = [] } = data;

  const prevChoicesLength = usePrevious(choices && choices.length);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  let focusNewChoice = false;

  if (choices && choices.length) {
    choices.forEach((choice, i) => {
      items.push({
        id: i + 1,
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

    // Focus newly added choice input.
    if (prevChoicesLength < choices.length) {
      focusNewChoice = true;
    }
  }

  return (
    <BaseControl label={__('Choices', 'lazy-blocks')}>
      <div className="lzb-constructor-controls-item-settings-choices">
        {items.length ? (
          <div className="lzb-constructor-controls-item-settings-choices-items">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;

                if (active.id !== over.id) {
                  resortChoice(active.id - 1, over.id - 1);
                }
              }}
            >
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((value, index) => {
                  return (
                    <SortableItem
                      key={`lzb-constructor-controls-item-settings-choices-item-${value.id}`}
                      {...value}
                      focusInput={index + 1 === choices.length ? focusNewChoice : false}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        ) : null}
        <div>
          <Button onClick={() => addChoice()} isSecondary isSmall>
            {__('+ Add Choice', 'lazy-blocks')}
          </Button>
        </div>
      </div>
    </BaseControl>
  );
}
