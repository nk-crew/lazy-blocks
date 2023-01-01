/* eslint-disable max-classes-per-file */
// Import CSS
import './editor.scss';
import 'react-virtualized/styles.css';

/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';
import { List, CellMeasurer, CellMeasurerCache, AutoSizer } from 'react-virtualized';

const { Fragment, useState, useEffect } = wp.element;

const { __ } = wp.i18n;

const { Button, Dropdown, Tooltip, BaseControl, TextControl, G, Path, SVG } = wp.components;

const { icons } = window.lazyblocksConstructorData || window.lazyblocksGutenberg;

// we need this lazy loading component to prevent a huge lags while first loading SVG icons
function Icon({ svg, onClick, active }) {
  return (
    <IconPicker.Preview
      className={classnames(
        'lazyblocks-component-icon-picker-button',
        active ? 'lazyblocks-component-icon-picker-button-active' : ''
      )}
      onClick={onClick}
      svg={svg}
    />
  );
}

const hiddenIconCategories = {};

const cellMCache = new CellMeasurerCache({
  defaultHeight: 65,
  fixedWidth: true,
});

/**
 * Dropdown
 */
function IconPickerDropdown(props) {
  const { onChange, value, label, className, renderToggle } = props;

  const [search, setSearch] = useState('');
  const [hiddenCategories, setHiddenCategories] = useState(hiddenIconCategories);

  useEffect(() => {
    if (cellMCache) {
      cellMCache.clearAll();
    }
  }, [props]);

  function getDropdownContent() {
    const rows = [
      {
        key: 'form',
        render: (
          <Fragment key="form">
            <TextControl
              label={__('Search Icon', 'lazy-blocks')}
              value={search}
              onChange={(searchVal) => setSearch(searchVal)}
              placeholder={__('Type to Search...', 'lazy-blocks')}
              autoComplete="off"
            />
          </Fragment>
        ),
      },
    ];

    Object.keys(icons).forEach((categoryName) => {
      const categoryIcons = icons[categoryName];
      const showCategory =
        typeof hiddenCategories[categoryName] !== 'undefined'
          ? hiddenCategories[categoryName]
          : true;
      const searchString = search.toLowerCase();

      // prepare all icons.
      const allIcons = Object.keys(categoryIcons)
        .filter((iconName) => {
          if (
            !searchString ||
            (searchString && iconName.indexOf(searchString.toLowerCase()) > -1)
          ) {
            return true;
          }

          return false;
        })
        .map((iconName) => {
          const icon = categoryIcons[iconName];

          return (
            <Tooltip key={categoryName + iconName} text={iconName}>
              {/* We need this <div> just because Tooltip don't work without it */}
              <div>
                <Icon
                  active={icon === value}
                  svg={icon}
                  onClick={() => {
                    onChange(icon);
                  }}
                />
              </div>
            </Tooltip>
          );
        });

      if (!allIcons.length) {
        return;
      }

      // prepare icons category toggle title.
      rows.push({
        key: `title-${categoryName}`,
        render: (
          // Used PanelBody https://github.com/WordPress/gutenberg/blob/master/packages/components/src/panel/body.js.
          <div
            className={classnames(
              'components-panel__body lazyblocks-component-icon-picker-list-panel-toggle',
              showCategory ? 'is-opened' : ''
            )}
          >
            <h2 className="components-panel__body-title">
              <Button
                className="components-panel__body-toggle"
                onClick={() => {
                  setHiddenCategories({
                    ...hiddenCategories,
                    [categoryName]: !showCategory,
                  });
                }}
                aria-expanded={showCategory}
              >
                {/*
                    Firefox + NVDA don't announce aria-expanded because the browser
                    repaints the whole element, so this wrapping span hides that.
                */}
                <span aria-hidden="true">
                  {showCategory ? (
                    <SVG
                      className="components-panel__arrow"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <G>
                        <Path fill="none" d="M0,0h24v24H0V0z" />
                      </G>
                      <G>
                        <Path d="M12,8l-6,6l1.41,1.41L12,10.83l4.59,4.58L18,14L12,8z" />
                      </G>
                    </SVG>
                  ) : (
                    <SVG
                      className="components-panel__arrow"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <G>
                        <Path fill="none" d="M0,0h24v24H0V0z" />
                      </G>
                      <G>
                        <Path d="M7.41,8.59L12,13.17l4.59-4.58L18,10l-6,6l-6-6L7.41,8.59z" />
                      </G>
                    </SVG>
                  )}
                </span>
                {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
              </Button>
            </h2>
          </div>
        ),
      });

      if (!showCategory) {
        return;
      }

      let currentIcons = [];

      allIcons.forEach((icon, i) => {
        currentIcons.push(icon);

        if (currentIcons.length === 3 || allIcons.length === i + 1) {
          rows.push({
            key: 'icons',
            render: <div className="lazyblocks-component-icon-picker-list">{currentIcons}</div>,
          });

          currentIcons = [];
        }
      });
    });

    // No icons.
    if (rows.length === 1) {
      rows.push({
        key: 'icons',
        render: __('No icons found.', 'lazy-blocks'),
      });
    }

    const result = (
      <AutoSizer>
        {({ width, height }) => (
          <List
            className="lazyblocks-component-icon-picker-list-wrap"
            width={width}
            height={height}
            rowCount={rows.length}
            rowHeight={cellMCache.rowHeight}
            // eslint-disable-next-line react/no-unstable-nested-components
            rowRenderer={(data) => {
              const { index, style, parent, key } = data;

              return (
                <CellMeasurer
                  cache={cellMCache}
                  columnIndex={0}
                  key={key}
                  rowIndex={index}
                  parent={parent}
                >
                  {() => <div style={style}>{rows[index].render || ''}</div>}
                </CellMeasurer>
              );
            }}
          />
        )}
      </AutoSizer>
    );

    return (
      <Fragment>
        <div className="lazyblocks-component-icon-picker-sizer" />
        <div className="lazyblocks-component-icon-picker">{result}</div>
      </Fragment>
    );
  }

  const dropdown = (
    <Dropdown
      className={className}
      contentClassName="lazyblocks-component-icon-picker-content"
      renderToggle={renderToggle}
      focusOnMount={false}
      // eslint-disable-next-line react/jsx-no-bind
      renderContent={getDropdownContent}
    />
  );

  return label ? (
    <BaseControl label={label} className={className}>
      {dropdown}
    </BaseControl>
  ) : (
    dropdown
  );
}

export default function IconPicker({ value, onChange, label }) {
  return (
    <IconPicker.Dropdown
      label={label}
      className="lazyblocks-component-icon-picker-wrapper"
      onChange={onChange}
      value={value}
      renderToggle={({ isOpen, onToggle }) => (
        <Tooltip text={__('Icon Picker', 'lazy-blocks')}>
          {/* We need this <div> just because Tooltip don't work without it */}
          <div>
            <IconPicker.Preview
              className="lazyblocks-component-icon-picker-button hover"
              aria-expanded={isOpen}
              onClick={onToggle}
              svg={value}
              alwaysRender
            />
          </div>
        </Tooltip>
      )}
    />
  );
}

// dropdown
IconPicker.Dropdown = IconPickerDropdown;

// preview icon.
IconPicker.Preview = function (props) {
  const { onClick, className, svg, alwaysRender = false } = props;

  let result = '';

  if (/^dashicons/.test(svg)) {
    result = <span className={`dashicons ${svg}`} />;
  } else if (svg) {
    // eslint-disable-next-line react/no-danger
    result = <span dangerouslySetInnerHTML={{ __html: svg }} />;
  }

  return result || alwaysRender ? (
    <span
      className={classnames(
        className,
        'lazyblocks-component-icon-picker-preview',
        onClick ? 'lazyblocks-component-icon-picker-preview-clickable' : ''
      )}
      onClick={onClick}
      onKeyPress={() => {}}
      role="button"
      tabIndex={0}
    >
      {result}
    </span>
  ) : (
    ''
  );
};
