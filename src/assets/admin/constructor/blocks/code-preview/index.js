/* eslint-disable react/no-danger */
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
            codePreview: null,
            error: null,
        };

        this.loadPreview = throttle( 2000, this.loadPreview.bind( this ) );
        this.iframeRef = createRef();
        this.setIframeContents = this.setIframeContents.bind( this );
    }

    componentDidMount() {
        this.loadPreview();
    }

    componentDidUpdate( prevProps ) {
        const {
            data,
            tab,
        } = this.props;

        if ( prevProps.data !== data || prevProps.tab !== tab ) {
            this.loadPreview();
        }
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

    setIframeContents( frame ) {
        const {
            codePreview,
        } = this.state;

        if ( frame ) {
            this.iframeRef.current = frame;

            if ( codePreview ) {
                const doc = frame.contentDocument;
                doc.open();
                doc.write( `<link rel="stylesheet" href="/wp-admin/load-styles.php?load[chunk_0]=common,media,themes" type="text/css" media="all" /><style>body {background: #fff !important;}</style>${ codePreview }` );
                doc.close();
                frame.style.width = '100%';
            }
        }
    }

    loadPreview() {
        const {
            data,
            tab,
        } = this.props;

        if ( data ) {
            const attributes = this.getAttributes();

            apiFetch( {
                path: 'lazy-blocks/v1/block-designer-preview',
                method: 'POST',
                data: {
                    slug: data.slug,
                    context: tab,
                    attributes,
                    block: data,
                },
            } )
                .then( ( { response, error, error_code: errorCode } ) => {
                    if ( error ) {
                        if ( 'lazy_block_no_render_callback' === errorCode ) {
                            this.setState( { codePreview: null, error: '' } );
                        } else { this.setState( { codePreview: null, error: response } ); }
                    } else {
                        this.setState( { codePreview: response, error: null }, () => this.setIframeContents( this.iframeRef.current ) );
                    }
                } ).catch( () => {
                    this.setState( { codePreview: null, error: 'Error' } );
                } );
        }
    }

    render() {
        const {
            error,
            codePreview,
        } = this.state;

        return (
            <div className="lzb-constructor-code-preview">
                <PanelBody>
                    <h2>{ __( 'Preview', '@@text_domain' ) }</h2>
                </PanelBody>
                <PanelBody>
                    { error && <code><pre className="lzb-error-box">{ error }</pre></code> }
                    <iframe src="about:blank" frameBorder="0" style={ error || null == codePreview ? { display: 'none' } : {} } ref={ this.setIframeContents } title="code-preview" />
                </PanelBody>
            </div>
        );
    }
}
export default CodePreview;
