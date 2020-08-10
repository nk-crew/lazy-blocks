// Import CSS
import './editor.scss';

/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

const { Component } = wp.element;

export default class Box extends Component {
    render() {
        const {
            'no-paddings': noPaddings,
        } = this.props;

        return (
            <div className={ classnames( 'lazyblocks-component-box', noPaddings ? 'lazyblocks-component-box-no-paddings' : '' ) }>
                { this.props.children }
            </div>
        );
    }
}
