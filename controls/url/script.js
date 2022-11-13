import shorthash from 'shorthash';

import BaseControl from '../../assets/components/base-control';

const { useState } = wp.element;

const { addFilter } = wp.hooks;

const { __experimentalLinkControl: LinkControl } = wp.blockEditor;

function ComponentRender(props) {
  const [key, setKey] = useState(shorthash.unique(`${new Date()}`));

  return (
    <BaseControl label={props.data.label} help={props.data.help}>
      <div className="lzb-gutenberg-url">
        <LinkControl
          key={key}
          className="wp-block-navigation-link__inline-link-input"
          opensInNewTab={false}
          value={{
            url: props.getValue(),
          }}
          onChange={({ url: newURL = '' }) => {
            props.onChange(newURL);
          }}
          onRemove={() => {
            props.onChange('');
            setKey(shorthash.unique(`${new Date()}`));
          }}
        />
      </div>
    </BaseControl>
  );
}

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.url.render', 'lzb.editor', (render, props) => (
  <ComponentRender {...props} />
));
