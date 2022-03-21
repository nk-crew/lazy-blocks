// Import CSS
import './editor.scss';

const { BaseControl, TextControl } = wp.components;

export default function BlockSlug(props) {
  return (
    <BaseControl label={props.label || ''}>
      <div className="lazyblocks-component-block-slug">
        <div className="lazyblocks-component-block-slug-prefix">lazyblock/</div>
        <TextControl
          {...{
            ...props,
            ...{ label: '' },
          }}
        />
      </div>
    </BaseControl>
  );
}
