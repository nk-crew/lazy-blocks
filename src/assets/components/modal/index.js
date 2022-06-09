/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

// Import CSS
import './editor.scss';

/**
 * WordPress dependencies
 */
const { Modal } = wp.components;

export default function ModalComponent(props) {
  let className = 'lzb-component-modal';

  if (props.position) {
    className = classnames(className, `lzb-component-modal-position-${props.position}`);
  }

  if (props.size) {
    className = classnames(className, `lzb-component-modal-size-${props.size}`);
  }

  className = classnames(className, props.className);

  return (
    <Modal {...props} className={className}>
      {props.children}
    </Modal>
  );
}
