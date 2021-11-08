/* eslint-disable react/no-danger */
import './editor.scss';
import { throttle } from 'throttle-debounce';

const {
    __,
} = wp.i18n;

const {
    Component,
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
                .then( ( { response, error } ) => {
                    if ( error ) {
                        this.setState( { codePreview: null, error: response } );
                    } else {
                        this.setState( { codePreview: response, error: null } );
                    }
                } ).catch( () => {
                    this.setState( { codePreview: null, error: 'Error' } );
                } );
        }
    }

    render() {
        const {
            codePreview,
            error,
        } = this.state;

        return (
            <div className="lzb-constructor-code-preview">
                <PanelBody>
                    <h2>{ __( 'Preview', '@@text_domain' ) }</h2>
                </PanelBody>
                <PanelBody>
                    { error ? <code><pre className="lzb-error-box">{ error }</pre></code>
                        : <div dangerouslySetInnerHTML={ { __html: codePreview } } /> }
                </PanelBody>
            </div>
        );
    }
}

export default CodePreview;
