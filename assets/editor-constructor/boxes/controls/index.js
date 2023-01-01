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
} from '@dnd-kit/sortable';

import './editor.scss';
import Control from './control';

const { __ } = wp.i18n;

const { Fragment, useEffect } = wp.element;

const { Tooltip, TabPanel } = wp.components;

const { useDispatch } = wp.data;

const constructorData = window.lazyblocksConstructorData;

let initialActiveTab = '';

export default function ControlsSettings(props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data } = props;

  useEffect(() => {
    // fix first loading focus on code editor
    const $tabsButton = document.querySelector('.lazyblocks-control-tabs button');

    if ($tabsButton) {
      $tabsButton.focus();
    }
  }, []);

  const {
    addControl: dispatchAddControl,
    removeControl,
    resortControl,
    updateControlData,
  } = useDispatch('lazy-blocks/block-data');

  function addControl(attributes, resortId) {
    dispatchAddControl(
      {
        ...constructorData.controls.text.attributes,
        ...attributes,
      },
      resortId
    );
  }

  function printControls(childOf = '', placement = '') {
    const { controls = {} } = data;

    const items = [];

    Object.keys(controls).forEach((id) => {
      const controlData = controls[id];
      const controlPlacement = controlData.placement || 'content';

      if (childOf !== controlData.child_of) {
        return;
      }

      if (!controlData.child_of && placement !== controlPlacement && controlPlacement !== 'both') {
        return;
      }

      items.push({
        addControl(newControlData, resortId) {
          addControl(newControlData, resortId);
        },
        removeControl(optionalId = false) {
          removeControl(optionalId || id);
        },
        updateData(newData, optionalId = false) {
          updateControlData(optionalId || id, newData);
        },
        printControls,
        data: controlData,
        id,
        controls,
      });
    });

    return (
      <Fragment>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
              resortControl(active.id, over.id);
            }
          }}
        >
          <div className="lzb-constructor-controls-items-sortable">
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {items.map((value) => (
                <Control key={`lzb-constructor-controls-items-sortable-${value.id}`} {...value} />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        <Tooltip
          text={childOf ? __('Add Child Control', 'lazy-blocks') : __('Add Control', 'lazy-blocks')}
        >
          {/* eslint-disable-next-line react/button-has-type */}
          <button
            className="lzb-constructor-controls-item-appender"
            onClick={() => {
              addControl({
                placement: placement || 'content',
                child_of: childOf,
              });
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </Tooltip>
      </Fragment>
    );
  }

  const { controls = {} } = data;

  const placementTabs = [
    {
      name: 'content',
      title: (
        <Fragment>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <rect x="7" y="7" width="8" height="10" rx="0.5" fill="currentColor" />
          </svg>
          {__('Content Controls', 'lazy-blocks')}
        </Fragment>
      ),
      className: 'lazyblocks-control-tabs-tab',
    },
    {
      name: 'inspector',
      title: (
        <Fragment>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <rect x="13" y="7" width="4" height="10" rx="0.5" fill="currentColor" />
          </svg>
          {__('Inspector Controls', 'lazy-blocks')}
        </Fragment>
      ),
      className: 'lazyblocks-control-tabs-tab',
    },
  ];

  // Check if there is hidden controls
  let thereIsHidden = false;

  Object.keys(controls).forEach((id) => {
    const controlData = controls[id];

    if (!controlData.child_of && controlData.placement === 'nowhere') {
      thereIsHidden = true;
    }
  });

  placementTabs.push({
    name: 'nowhere',
    title: __('Hidden', 'lazy-blocks'),
    className: classnames(
      'lazyblocks-control-tabs-tab',
      !thereIsHidden ? 'lazyblocks-control-tabs-tab-hidden' : ''
    ),
  });

  // set initial active tab.
  if (!initialActiveTab) {
    initialActiveTab = 'inspector';
    let contentControlsCount = 0;
    let inspectorControlsCount = 0;
    let nowhereControlsCount = 0;

    Object.keys(controls).forEach((id) => {
      const controlData = controls[id];

      switch (controlData.placement) {
        case 'content':
          contentControlsCount += 1;
          break;
        case 'inspector':
          inspectorControlsCount += 1;
          break;
        case 'nowhere':
          nowhereControlsCount += 1;
          break;
        // no default
      }
    });

    if (!inspectorControlsCount) {
      if (contentControlsCount) {
        initialActiveTab = 'content';
      } else if (nowhereControlsCount) {
        initialActiveTab = 'nowhere';
      }
    }
  }

  return (
    <div className="lzb-constructor-controls">
      <TabPanel
        className="lazyblocks-control-tabs"
        activeClass="is-active"
        initialTabName={initialActiveTab}
        tabs={placementTabs}
      >
        {(tab) => printControls('', tab.name)}
      </TabPanel>
    </div>
  );
}
