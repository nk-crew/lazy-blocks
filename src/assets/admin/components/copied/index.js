// Import CSS
import './editor.scss';

const { __ } = wp.i18n;

const { Component } = wp.element;

export default class Copied extends Component {
  render() {
    return (
      <div className="lazyblocks-component-copied">
        {this.props.children || __('Copied!', '@@text_domain')}
      </div>
    );
  }
}
