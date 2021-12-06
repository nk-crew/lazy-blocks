import './editor.scss';
import { throttle } from 'throttle-debounce';

const {
    __,
} = wp.i18n;

const {
    Component,
    createRef,
} = wp.element;

const { apiFetch } = wp;

const {
    PanelBody,
} = wp.components;

class CodePreview extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            codePreview: '',
        };

        this.loadPreview = throttle( 2000, this.loadPreview.bind( this ) );
        this.iframeRef = createRef();
        this.setIframeContents = this.setIframeContents.bind( this );
        this.setIframeHeight = this.setIframeHeight.bind( this );
        this.calculateIframeHeight = this.calculateIframeHeight.bind( this );
    }

    componentDidMount() {
        this.loadPreview();
    }

    componentDidUpdate( prevProps ) {
        const {
            data,
            codeContext,
        } = this.props;

        if ( prevProps.data !== data || prevProps.codeContext !== codeContext ) {
            this.loadPreview();
        }
    }

    componentWillUnmount() {
        const iframe = this.iframeRef.current;

        this.iframeObserver.disconnect();
        iframe.removeEventListener( 'load', this.setIframeHeight );
    }

    getAttributes() {
        const {
            data,
        } = this.props;

        const result = {};

        if ( data.controls ) {
            Object.values( data.controls ).forEach( ( control ) => {
                if ( control.name && ! control.child_of ) {
                    result[ control.name ] = control.default;
                }
            } );
        }
        return result;
    }

    setIframeContents() {
        const {
            codePreview,
        } = this.state;

        return `
            <link rel="stylesheet" href="/wp-admin/load-styles.php?load[chunk_0]=common,media,themes" type="text/css" media="all" />
            <style>
                html {
                    height: auto;
                }
                body {
                    background: #fff !important;
                    overflow: auto;
                }
            </style>
            ${ codePreview }
        `;
    }

    setIframeHeight() {
        const iframe = this.iframeRef.current;

        // Pick the maximum of these two values to account for margin collapsing.
        const height = Math.max(
            iframe.contentDocument.documentElement.offsetHeight,
            iframe.contentDocument.body.offsetHeight
        );

        iframe.style.height = `${ height }px`;
    }

    calculateIframeHeight( iframe ) {
        if ( ! iframe ) {
            return;
        }

        this.iframeRef.current = iframe;

        const { IntersectionObserver } = iframe.ownerDocument.defaultView;

        // Observe for intersections that might cause a change in the height of
        // the iframe, e.g. a Widget Area becoming expanded.
        this.iframeObserver = new IntersectionObserver(
            ( [ entry ] ) => {
                if ( entry.isIntersecting ) {
                    this.setIframeHeight();
                }
            },
            {
                threshold: 1,
            }
        );
        this.iframeObserver.observe( iframe );

        iframe.addEventListener( 'load', this.setIframeHeight );
    }

    loadPreview() {
        const {
            data,
            codeContext,
        } = this.props;

        if ( data ) {
            const attributes = this.getAttributes();

            apiFetch( {
                path: 'lazy-blocks/v1/block-constructor-preview',
                method: 'POST',
                data: {
                    context: codeContext,
                    attributes,
                    block: data,
                },
            } )
                .then( ( { response, error, error_code: errorCode } ) => {
                    if ( error ) {
                        if ( 'lazy_block_no_render_callback' === errorCode ) {
                            this.setState( { codePreview: '' } );
                        } else {
                            this.setState( { codePreview: `<pre>${ response }</pre>` } );
                        }
                    } else {
                        this.setState( { codePreview: response } );
                    }
                } ).catch( () => {
                    this.setState( { codePreview: __( 'Error: Could not generate the preview.', '@@text_domain' ) } );
                } );
        }
    }

    render() {
        return (
            <div className="lazyblocks-component-box lazyblocks-component-box-no-paddings lzb-constructor-code-preview">
                <PanelBody>
                    <h2>{ __( 'Preview', '@@text_domain' ) }</h2>
                </PanelBody>
                <PanelBody>
                    <iframe
                        srcDoc={ this.setIframeContents() }
                        ref={ this.calculateIframeHeight }
                        frameBorder="0"
                        title="code-preview"
                    />
                </PanelBody>
            </div>
        );
    }
}
export default CodePreview;
