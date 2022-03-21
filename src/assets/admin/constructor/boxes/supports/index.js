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
        label={__('Multiple', '@@text_domain')}
        help={__('Allow use block multiple times on the page.', '@@text_domain')}
        checked={supportsMultiple}
        onChange={(value) => updateData({ supports_multiple: value })}
      />
      <ToggleControl
        label={__('Class Name', '@@text_domain')}
        help={__('Additional field to add custom class name.', '@@text_domain')}
        checked={supportsClassname}
        onChange={(value) => updateData({ supports_classname: value })}
      />
      <ToggleControl
        label={__('Anchor', '@@text_domain')}
        help={__('Additional field to add block ID attribute.', '@@text_domain')}
        checked={supportsAnchor}
        onChange={(value) => updateData({ supports_anchor: value })}
      />
      <ToggleControl
        label={__('Inserter', '@@text_domain')}
        help={__('Show block in blocks inserter.', '@@text_domain')}
        checked={supportsInserter}
        onChange={(value) => updateData({ supports_inserter: value })}
      />
      <BaseControl label={__('Align', '@@text_domain')}>
        <Select
          isMulti
          placeholder={__('Select align options', '@@text_domain')}
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
      <h3>{__('Ghost Kit Extensions', '@@text_domain')}</h3>
      {!window.GHOSTKIT ? (
        <BaseControl>
          <Notice isDismissible={false} className="lzb-constructor-notice">
            <p>{__('Install Ghost Kit plugin to use the following settings.', '@@text_domain')}</p>
            <Button
              isPrimary
              isSmall
              href="https://wordpress.org/plugins/ghostkit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {__('Install', '@@text_domain')}
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
            <p>{__('To use these extensions required "Class Name" support.', '@@text_domain')}</p>
          </Notice>
        </BaseControl>
      ) : (
        ''
      )}
      <GktWrap>
        <ToggleControl
          label={__('Spacings', '@@text_domain')}
          help={__('Change block margins and paddings.', '@@text_domain')}
          checked={supportsGktSpacings}
          onChange={(value) => updateData({ supports_ghostkit_spacings: value })}
        />
        <ToggleControl
          label={__('Display', '@@text_domain')}
          help={__('Display / Hide blocks on different screen sizes.', '@@text_domain')}
          checked={supportsGktDisplay}
          onChange={(value) => updateData({ supports_ghostkit_display: value })}
        />
        <ToggleControl
          label={__('Animate on Scroll', '@@text_domain')}
          help={__('Display block with animation on scroll.', '@@text_domain')}
          checked={supportsGktScrollReveal}
          onChange={(value) => updateData({ supports_ghostkit_scroll_reveal: value })}
        />
        <ToggleControl
          label={__('Frame', '@@text_domain')}
          help={__('Add border and box shadow to block.', '@@text_domain')}
          checked={supportsGktFrame}
          onChange={(value) => updateData({ supports_ghostkit_frame: value })}
        />
        <ToggleControl
          label={__('Custom CSS', '@@text_domain')}
          help={__('Write custom CSS on each inserted blocks.', '@@text_domain')}
          checked={supportsGktCustomCSS}
          onChange={(value) => updateData({ supports_ghostkit_custom_css: value })}
        />
      </GktWrap>
    </Fragment>
  );
}
