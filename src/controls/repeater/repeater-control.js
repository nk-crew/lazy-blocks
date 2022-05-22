import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const { __ } = wp.i18n;
const { useRef, useEffect, useState } = wp.element;
const { BaseControl, Button, Tooltip, ToggleControl } = wp.components;

const { withInstanceId } = wp.compose;

const DragHandle = SortableHandle(() => (
  <Button
    className="lzb-gutenberg-repeater-btn-drag"
    onClick={(e) => {
      e.stopPropagation();
    }}
    role="button"
  >
    <svg
      width="18"
      height="18"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 4h2V2H5v2zm6-2v2h2V2h-2zm-6 8h2V8H5v2zm6 0h2V8h-2v2zm-6 6h2v-2H5v2zm6 0h2v-2h-2v2z" />
    </svg>
  </Button>
));

const SortableItem = SortableElement((data) => (
  <div className="lzb-gutenberg-repeater-item">
    {/* eslint-disable-next-line react/button-has-type */}
    <button
      className={`lzb-gutenberg-repeater-btn${
        data.active ? ' lzb-gutenberg-repeater-btn-active' : ''
      }`}
      onClick={data.onToggle}
    >
      <DragHandle />
      <div
        className="lzb-gutenberg-repeater-btn-title"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: data.title }}
      />
      <div className="lzb-gutenberg-repeater-btn-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
        </svg>
      </div>
    </button>
    {!data.controlData.rows_min || data.count > data.controlData.rows_min ? (
      // eslint-disable-next-line react/button-has-type
      <button className="lzb-gutenberg-repeater-btn-remove" onClick={data.onRemove}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-2 -2 24 24"
          width="24"
          height="24"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 4h3c.6 0 1 .4 1 1v1H3V5c0-.6.5-1 1-1h3c.2-1.1 1.3-2 2.5-2s2.3.9 2.5 2zM8 4h3c-.2-.6-.9-1-1.5-1S8.2 3.4 8 4zM4 7h11l-.9 10.1c0 .5-.5.9-1 .9H5.9c-.5 0-.9-.4-1-.9L4 7z" />
        </svg>
      </button>
    ) : (
      ''
    )}
    {data.active ? data.renderContent() : ''}
  </div>
));
const SortableList = SortableContainer(({ items }) => (
  <div className="lzb-gutenberg-repeater-items">
    {items.map((value, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <SortableItem key={`repeater-item-${index}`} index={index} {...value} />
    ))}
  </div>
));

function RepeaterControl(props) {
  const {
    label,
    count = 0,
    controlData,
    renderRow = () => {},
    addRow = () => {},
    removeRow = () => {},
    resortRow = () => {},
    getInnerControls = () => {},
  } = props;

  const $sortRef = useRef();

  let activeItemDefault = -1;

  if (controlData.rows_collapsible === 'false') {
    activeItemDefault = -2;
  } else if (controlData.rows_collapsed === 'false') {
    activeItemDefault = -2;
  }

  const [activeItem, setActiveItem] = useState(activeItemDefault);

  function getRowTitle(i) {
    const valObjectVariants = ['alt', 'url', 'title', 'caption', 'description', 'id', 'link'];
    let title = controlData.rows_label || __('Row {{#}}', '@@text_domain');

    // add row number.
    title = title.replace(/{{#}}/g, i + 1);

    const innerControls = getInnerControls(i);

    // add inner controls values.
    if (innerControls) {
      Object.keys(innerControls).forEach((k) => {
        const { data } = innerControls[k];

        let val = innerControls[k].val || '';

        // Prepare object value variants.
        if (typeof val === 'object') {
          valObjectVariants.forEach((tag) => {
            title = title.replace(new RegExp(`{{${data.name}.${tag}}}`, 'g'), val[tag] || '');
          });
        }

        // Add support for image control tag displaying.
        if (data.type === 'image' && val.url) {
          val = `<img src="${val.url}" loading="lazy" />`;
        }

        // In case if value is object - display nothing.
        if (typeof val === 'object') {
          val = '';
        }

        title = title.replace(new RegExp(`{{${data.name}}}`, 'g'), val);
      });
    }

    return title;
  }

  // Mount.
  useEffect(() => {
    // add rows to meet Minimum requirements
    if (controlData.rows_min && controlData.rows_min > 0 && controlData.rows_min > count) {
      const needToAdd = controlData.rows_min - count;

      for (let i = 0; i < needToAdd; i += 1) {
        addRow();
      }
    }
  }, []);

  const items = [];
  for (let i = 0; i < count; i += 1) {
    const active = activeItem === -2 || activeItem === i;

    items.push({
      title: getRowTitle(i),
      active,
      count,
      controlData,
      onToggle: (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (controlData.rows_collapsible === 'true') {
          setActiveItem(active ? -1 : i);
        }
      },
      onRemove: (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeRow(i);
      },
      renderContent: () => (
        <div className="lzb-gutenberg-repeater-item-content">{renderRow(i)}</div>
      ),
    });
  }

  return (
    <BaseControl label={label}>
      <div className="lzb-gutenberg-repeater">
        {items.length ? (
          <SortableList
            ref={$sortRef}
            items={items}
            onSortEnd={({ oldIndex, newIndex }) => {
              resortRow(oldIndex, newIndex);

              if (activeItem > -1) {
                setActiveItem(newIndex);
              }
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
        <div className="lzb-gutenberg-repeater-options">
          <Button
            isSecondary
            isSmall
            disabled={controlData.rows_max && count >= controlData.rows_max}
            onClick={() => {
              addRow();
            }}
          >
            {controlData.rows_add_button_label || __('+ Add Row', '@@text_domain')}
          </Button>
          {controlData.rows_collapsible === 'true' && items.length && items.length > 1 ? (
            <Tooltip text={__('Toggle all rows', '@@text_domain')}>
              <div>
                {/* For some reason Tooltip is not working without this <div> */}
                <ToggleControl
                  checked={activeItem === -2}
                  onChange={() => {
                    setActiveItem(activeItem ? -1 : -2);
                  }}
                />
              </div>
            </Tooltip>
          ) : (
            ''
          )}
        </div>
      </div>
    </BaseControl>
  );
}

export default withInstanceId(RepeaterControl);
