/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

import BaseControl from '../../assets/components/base-control';

const { __ } = wp.i18n;

const { addFilter } = wp.hooks;

const { __experimentalGetSettings: getSettings, dateI18n } = wp.date;

const { Dropdown, PanelBody, ButtonGroup, Button, DatePicker, TimePicker } = wp.components;

const currentTimezone =
  typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 0;

/**
 * Date Time Picker.
 */
function DateTimePicker(props) {
  const { value, onChange, label, help, allowTimePicker = true, allowDatePicker = true } = props;

  const settings = getSettings();

  // To know if the current timezone is a 12 hour time with look for an "a" in the time format.
  // We also make sure this a is not escaped by a "/".
  const is12Hour = /a(?!\\)/i.test(
    settings.formats.time
      .toLowerCase() // Test only the lower case a
      .replace(/\\\\/g, '') // Replace "//" with empty strings
      .split('')
      .reverse()
      .join('') // Reverse the string and test for "a" not followed by a slash
  );

  // Date.
  let buttonLabel = __('Select Date', 'lazy-blocks');
  let resolvedFormat = settings.formats.date || 'F j, Y';

  // Date + Time.
  if (allowTimePicker && allowDatePicker) {
    buttonLabel = __('Select Date and Time', 'lazy-blocks');
    resolvedFormat = settings.formats.datetime || 'F j, Y g:i a';

    // Time.
  } else if (allowTimePicker) {
    buttonLabel = __('Select Time', 'lazy-blocks');
    resolvedFormat = settings.formats.time || 'g:i a';
  }

  const formattedDate = value ? dateI18n(resolvedFormat, value, currentTimezone) : buttonLabel;

  return (
    <BaseControl label={label} help={help}>
      <div>
        <Dropdown
          popoverProps={{
            placement: 'left-start',
            offset: 36,
            shift: true,
          }}
          renderToggle={({ isOpen, onToggle }) => (
            <Button
              isLink
              aria-expanded={isOpen}
              onClick={onToggle}
              className="lzb-date-time-picker-toggle"
            >
              {allowDatePicker ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  enableBackground="new 0 0 24 24"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <g>
                    <rect fill="none" height="24" width="24" x="0" />
                  </g>
                  <g>
                    <g>
                      <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M12.5,7H11v6l5.2,3.2l0.8-1.3l-4.5-2.7V7z" />
                    </g>
                  </g>
                </svg>
              )}

              {formattedDate}
            </Button>
          )}
          renderContent={() => (
            <div
              className={classnames(
                'components-datetime',
                'lzb-gutenberg-date-time-picker',
                allowTimePicker ? 'lzb-gutenberg-date-time-picker-allowed-time' : '',
                allowDatePicker ? 'lzb-gutenberg-date-time-picker-allowed-date' : ''
              )}
            >
              <TimePicker currentTime={value} onChange={onChange} is12Hour={is12Hour} />
              {allowDatePicker ? (
                <DatePicker currentDate={value} onChange={onChange} onMonthPreviewed={() => {}} />
              ) : (
                ''
              )}
            </div>
          )}
        />
      </div>
    </BaseControl>
  );
}

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.date_time.render', 'lzb.editor', (render, props) => {
  const { label, help, date_time_picker: dateTimePicker } = props.data;

  return (
    <DateTimePicker
      label={label}
      help={help}
      allowTimePicker={/time/.test(dateTimePicker)}
      allowDatePicker={/date/.test(dateTimePicker)}
      value={props.getValue()}
      onChange={props.onChange}
    />
  );
});

/**
 * Control settings render in constructor.
 */
addFilter('lzb.constructor.control.date_time.settings', 'lzb.constructor', (render, props) => {
  const { updateData, data } = props;

  const { date_time_picker: dateTimePicker } = data;

  return (
    <PanelBody>
      <ButtonGroup>
        <Button
          isSmall
          isPrimary={/date/.test(dateTimePicker)}
          isPressed={/date/.test(dateTimePicker)}
          onClick={() => {
            let result = 'date';

            if (dateTimePicker === 'date_time') {
              result = 'time';
            } else if (dateTimePicker === 'date') {
              result = 'date';
            } else if (dateTimePicker === 'time') {
              result = 'date_time';
            }

            updateData({
              date_time_picker: result,
            });
          }}
        >
          {__('Date', 'lazy-blocks')}
        </Button>
        <Button
          isSmall
          isPrimary={/time/.test(dateTimePicker)}
          isPressed={/time/.test(dateTimePicker)}
          onClick={() => {
            let result = 'time';

            if (dateTimePicker === 'date_time') {
              result = 'date';
            } else if (dateTimePicker === 'time') {
              result = 'time';
            } else if (dateTimePicker === 'date') {
              result = 'date_time';
            }

            updateData({
              date_time_picker: result,
            });
          }}
        >
          {__('Time', 'lazy-blocks')}
        </Button>
      </ButtonGroup>
    </PanelBody>
  );
});
