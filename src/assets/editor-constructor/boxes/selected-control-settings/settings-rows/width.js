const { __ } = wp.i18n;

const { PanelBody, BaseControl, ButtonGroup, Button } = wp.components;

export default function WidthRow(props) {
  const { updateData, data } = props;

  const widths = {
    25: __('25%', '@@text_domain'),
    50: __('50%', '@@text_domain'),
    75: __('75%', '@@text_domain'),
    100: __('100%', '@@text_domain'),
  };
  let thereIsActive = false;

  return (
    <PanelBody>
      <BaseControl
        label={__('Width', '@@text_domain')}
        value={data.width}
        onChange={(value) => updateData({ width: value })}
      >
        <div />
        <ButtonGroup>
          {Object.keys(widths).map((w) => {
            let isActive = w === data.width;

            if (!thereIsActive && isActive) {
              thereIsActive = isActive;
            }

            if (!thereIsActive && w === '100') {
              isActive = true;
            }

            return (
              <Button
                key={w}
                isPrimary={isActive}
                isPressed={isActive}
                isSmall
                onClick={() => {
                  updateData({ width: `${w}` });
                }}
              >
                {widths[w]}
              </Button>
            );
          })}
        </ButtonGroup>
      </BaseControl>
    </PanelBody>
  );
}
