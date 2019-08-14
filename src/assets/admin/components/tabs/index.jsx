// Import CSS
import './editor.scss';

const { Component } = wp.element;
const {
    BaseControl,
    TabPanel,
} = wp.components;

export default class Tabs extends Component {
    render() {
        return (
            <BaseControl>
                <TabPanel
                    tabs={ this.props.tabs }
                    className="lazyblocks-component-tabs"
                >
                    { this.props.children }
                </TabPanel>
            </BaseControl>
        );
    }
}
