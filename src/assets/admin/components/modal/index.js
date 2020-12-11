/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

// Import CSS
import './editor.scss';

/**
 * WordPress dependencies
 */
const {
    Component,
} = wp.element;

const {
    Modal,
} = wp.components;

/**
 * Component Class
 */
export default class ModalComponent extends Component {
    render() {
        let className = 'lzb-component-modal';

        if ( this.props.position ) {
            className = classnames( className, `lzb-component-modal-position-${ this.props.position }` );
        }

        if ( this.props.size ) {
            className = classnames( className, `lzb-component-modal-size-${ this.props.size }` );
        }

        className = classnames( className, this.props.className );

        return (
            <Modal
                { ...this.props }
                className={ className }
            >
                { this.props.children }
            </Modal>
        );
    }
}
