const {
    __,
} = wp.i18n;

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
            return <div style={ { margin: '16px' } }>{ __( 'Error: Could not generate the preview.', '@@text_domain' ) }</div>;
        }

        return this.props.children;
    }
}
export default PreviewErrorBoundary;
