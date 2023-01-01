/* eslint-disable indent */
import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { Notice, BaseControl, Button, ToggleControl, Disabled } = wp.components;

export default function SupportsSettings(props) {
  const { data, updateData } = props;

  const {
    supports_multiple: supportsMultiple,
    supports_classname: supportsClassname,
    supports_anchor: supportsAnchor,
    supports_inserter: supportsInserter,
    supports_align: supportsAlign,

    supports_ghostkit_spacings: supportsGktSpacings,
    supports_ghostkit_display: supportsGktDisplay,
    supports_ghostkit_scroll_reveal: supportsGktScrollReveal,
    supports_ghostkit_frame: supportsGktFrame,
    supports_ghostkit_custom_css: supportsGktCustomCSS,
  } = data;

  let GktWrap = 'div';

  if (!window.GHOSTKIT) {
    GktWrap = Disabled;
  }

  return (
    <Fragment>
      <ToggleControl
        label={__('Multiple', 'lazy-blocks')}
        help={__('Allow use block multiple times on the page.', 'lazy-blocks')}
        checked={supportsMultiple}
        onChange={(value) => updateData({ supports_multiple: value })}
      />
      <ToggleControl
        label={__('Class Name', 'lazy-blocks')}
        help={__('Additional field to add custom class name.', 'lazy-blocks')}
        checked={supportsClassname}
        onChange={(value) => updateData({ supports_classname: value })}
      />
      <ToggleControl
        label={__('Anchor', 'lazy-blocks')}
        help={__('Additional field to add block ID attribute.', 'lazy-blocks')}
        checked={supportsAnchor}
        onChange={(value) => updateData({ supports_anchor: value })}
      />
      <ToggleControl
        label={__('Inserter', 'lazy-blocks')}
        help={__('Show block in blocks inserter.', 'lazy-blocks')}
        checked={supportsInserter}
        onChange={(value) => updateData({ supports_inserter: value })}
      />
      <BaseControl label={__('Align', 'lazy-blocks')}>
        <Select
          isMulti
          placeholder={__('Select align options', 'lazy-blocks')}
          options={['wide', 'full', 'left', 'center', 'right'].map((alignName) => ({
            value: alignName,
            label: alignName,
          }))}
          value={(() => {
            if (supportsAlign && supportsAlign.length) {
              const result = supportsAlign
                .filter((val) => val !== 'none')
                .map((val) => ({
                  value: val,
                  label: val,
                }));
              return result;
            }
            return [];
          })()}
          onChange={(value) => {
            if (value) {
              const result = [];

              value.forEach((optionData) => {
                result.push(optionData.value);
              });

              updateData({ supports_align: result });
            } else {
              updateData({ supports_align: ['none'] });
            }
          }}
        />
      </BaseControl>
      <h3>{__('Ghost Kit Extensions', 'lazy-blocks')}</h3>
      {!window.GHOSTKIT ? (
        <BaseControl>
          <Notice isDismissible={false} className="lzb-constructor-notice">
            <p>{__('Install Ghost Kit plugin to use the following settings.', 'lazy-blocks')}</p>
            <Button
              isPrimary
              isSmall
              href="https://wordpress.org/plugins/ghostkit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {__('Install', 'lazy-blocks')}
            </Button>
          </Notice>
        </BaseControl>
      ) : (
        ''
      )}
      {window.GHOSTKIT &&
      (supportsGktSpacings || supportsGktDisplay || supportsGktFrame || supportsGktCustomCSS) &&
      !supportsClassname ? (
        <BaseControl>
          <Notice status="error" isDismissible={false} className="lzb-constructor-notice">
            <p>{__('To use these extensions required "Class Name" support.', 'lazy-blocks')}</p>
          </Notice>
        </BaseControl>
      ) : (
        ''
      )}
      <GktWrap>
        <ToggleControl
          label={__('Spacings', 'lazy-blocks')}
          help={__('Change block margins and paddings.', 'lazy-blocks')}
          checked={supportsGktSpacings}
          onChange={(value) => updateData({ supports_ghostkit_spacings: value })}
        />
        <ToggleControl
          label={__('Display', 'lazy-blocks')}
          help={__('Display / Hide blocks on different screen sizes.', 'lazy-blocks')}
          checked={supportsGktDisplay}
          onChange={(value) => updateData({ supports_ghostkit_display: value })}
        />
        <ToggleControl
          label={__('Animate on Scroll', 'lazy-blocks')}
          help={__('Display block with animation on scroll.', 'lazy-blocks')}
          checked={supportsGktScrollReveal}
          onChange={(value) => updateData({ supports_ghostkit_scroll_reveal: value })}
        />
        <ToggleControl
          label={__('Frame', 'lazy-blocks')}
          help={__('Add border and box shadow to block.', 'lazy-blocks')}
          checked={supportsGktFrame}
          onChange={(value) => updateData({ supports_ghostkit_frame: value })}
        />
        <ToggleControl
          label={__('Custom CSS', 'lazy-blocks')}
          help={__('Write custom CSS on each inserted blocks.', 'lazy-blocks')}
          checked={supportsGktCustomCSS}
          onChange={(value) => updateData({ supports_ghostkit_custom_css: value })}
        />
      </GktWrap>
    </Fragment>
  );
}
