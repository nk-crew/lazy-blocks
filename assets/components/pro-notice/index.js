// Import CSS
import './editor.scss';

const { __ } = wp.i18n;

const { PanelBody, BaseControl } = wp.components;

const { lazyblocksConstructorData } = window;

export default function ProNotice() {
  if (lazyblocksConstructorData.is_pro) {
    return null;
  }

  return (
    <PanelBody>
      <BaseControl
        label={__('Unlock Extra Features', 'lazy-blocks')}
        className="lazyblocks-component-pro-notice"
      >
        <div>
          <a target="_blank" rel="noreferrer" href={lazyblocksConstructorData.pro_url}>
            {__('Upgrade to Lazy Blocks Pro', 'lazy-blocks')}
          </a>
        </div>
      </BaseControl>
    </PanelBody>
  );
}
