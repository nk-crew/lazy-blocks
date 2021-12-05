const {
    Component,
} = wp.element;

class PreviewErrorBoundary extends Component {
    constructor( props ) {
        super( props );
        this.state = { hasError: false };
    }

    static getDerivedStateFromError( ) {
        return { hasError: true };
    }

    componentDidCatch( ) {

    }

    render() {
        if ( this.state.hasError ) {
            // You can render any custom fallback UI
            return <div style={ { margin: '16px' } }>Error: Could not generate the preview.</div>;
        }

        return this.props.children;
    }
}
export default PreviewErrorBoundary;
