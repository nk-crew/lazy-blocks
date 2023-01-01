const { __ } = wp.i18n;

const { PanelBody, BaseControl, ButtonGroup, Button } = wp.components;

export default function WidthRow(props) {
  const { updateData, data } = props;

  const widths = {
    25: __('25%', 'lazy-blocks'),
    50: __('50%', 'lazy-blocks'),
    75: __('75%', 'lazy-blocks'),
    100: __('100%', 'lazy-blocks'),
  };
  let thereIsActive = false;

  return (
    <PanelBody>
      <BaseControl
        label={__('Width', 'lazy-blocks')}
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
