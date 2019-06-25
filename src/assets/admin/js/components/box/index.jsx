// Import CSS
import './editor.scss';

const { Component } = wp.element;

export default class Box extends Component {
    render() {
        return (
            <div
                className="lazyblocks-component-box"
            >
                { this.props.children }
            </div>
        );
    }
}
