// Import CSS
import './editor.scss';

const { BaseControl, TabPanel } = wp.components;

export default function Tabs({ tabs, children }) {
  return (
    <BaseControl>
      <TabPanel tabs={tabs} className="lazyblocks-component-tabs">
        {children}
      </TabPanel>
    </BaseControl>
  );
}
