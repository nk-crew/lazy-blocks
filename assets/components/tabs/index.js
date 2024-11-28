/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { BaseControl, TabPanel } from '@wordpress/components';

export default function Tabs({ tabs, children }) {
	return (
		<BaseControl __nextHasNoMarginBottom>
			<TabPanel tabs={tabs} className="lazyblocks-component-tabs">
				{children}
			</TabPanel>
		</BaseControl>
	);
}
