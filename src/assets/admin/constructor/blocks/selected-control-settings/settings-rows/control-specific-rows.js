const { Component } = wp.element;

const { applyFilters } = wp.hooks;

export default class ControlSpecificRows extends Component {
  render() {
    const result = applyFilters(
      `lzb.constructor.control.${this.props.data.type}.settings`,
      '',
      this.props
    );

    return applyFilters('lzb.constructor.control.settings', result, this.props);
  }
}
