/**
 * WordPress dependencies.
 */

import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class PreviewErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch() {}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ margin: '16px' }}>
					{__(
						'Error: Could not generate the preview.',
						'lazy-blocks'
					)}
				</div>
			);
		}

		return this.props.children;
	}
}
export default PreviewErrorBoundary;
