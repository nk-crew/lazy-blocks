// Import CSS
import './editor.scss';

const { Component } = wp.element;
const {
    TabPanel,
} = wp.components;

export default class Tabs extends Component {
    render() {
        return (
            <TabPanel
                tabs={ this.props.tabs }
                className="lazyblocks-component-tabs"
            >
                { this.props.children }
            </TabPanel>
        );
    }
}
