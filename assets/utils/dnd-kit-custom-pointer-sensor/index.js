import { PointerSensor } from '@dnd-kit/core';

export default class CustomPointerSensor extends PointerSensor {
	constructor(props, events) {
		super(props, events);

		// Fix for editor iframe.
		// For some reason, dnd-kit does not recognize iframe window properly.
		this.customAttach = this.customAttach.bind(this);
		this.customDetach = this.customDetach.bind(this);
		this.customPointerMove = this.customPointerMove.bind(this);
		this.customPointerUp = this.customPointerUp.bind(this);
		this.customResize = this.customResize.bind(this);

		const editorIframe = props?.event?.target?.ownerDocument?.defaultView;

		if (editorIframe) {
			this.editorIframe = editorIframe;
			this.customAttach();
		}
	}

	// Add custom methods.
	customAttach() {
		if (!this.editorIframe) {
			return;
		}

		this.editorIframe.addEventListener(
			'pointermove',
			this.customPointerMove
		);
		this.editorIframe.addEventListener('pointerup', this.customPointerUp);
		this.editorIframe.addEventListener('resize', this.customResize);
	}
	customDetach() {
		if (!this.editorIframe) {
			return;
		}

		this.editorIframe.removeEventListener(
			'pointermove',
			this.customPointerMove
		);
		this.editorIframe.removeEventListener(
			'pointerup',
			this.customPointerUp
		);
		this.editorIframe.removeEventListener('resize', this.customResize);
	}

	customPointerMove(event) {
		if (!this.editorIframe) {
			return;
		}

		this.handleMove(event);
	}
	customPointerUp(event) {
		if (!this.editorIframe) {
			return;
		}

		this.handleEnd(event);
	}
	customResize(event) {
		if (!this.editorIframe) {
			return;
		}

		this.handleCancel(event);
	}

	// Overwrite default methods.
	handleEnd() {
		const { onEnd } = this.props;

		this.detach();
		this.customDetach();
		onEnd();
	}
	handleCancel() {
		const { onCancel } = this.props;

		this.detach();
		this.customDetach();
		onCancel();
	}
}
