const { __ } = wp.i18n;
const { useState, useEffect } = wp.element;
const { PanelBody, TextControl, Notice } = wp.components;

function checkNameSlug(slug) {
  return /^[A-Za-z0-9-_]*$/.test(slug);
}

export default function NameRow(props) {
  const [isNameValid, setIsNameValid] = useState(true);

  const { updateData, data } = props;

  const { name = '' } = data;

  useEffect(() => {
    const isValid = checkNameSlug(name);

    if (isValid !== isNameValid) {
      setIsNameValid(isValid);
    }
  }, [name]);

  return (
    <PanelBody>
      <TextControl
        label={__('Name', 'lazy-blocks')}
        value={name}
        onChange={(value) => updateData({ name: value })}
      />
      {!isNameValid ? (
        <Notice status="error" isDismissible={false} className="lzb-constructor-notice">
          {__(
            'Control name must include only alphanumeric characters, dashes or underscores. Example: my-control-name',
            'lazy-blocks'
          )}
        </Notice>
      ) : (
        ''
      )}
    </PanelBody>
  );
}
