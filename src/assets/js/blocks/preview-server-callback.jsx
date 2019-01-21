/**
 * External dependencies.
 */
import { debounce } from 'throttle-debounce';
import deepEqual from 'deep-equal';

/**
 * WordPress dependencies.
 */
const {
    Spinner,
} = wp.components;
const {
    Component,
    RawHTML,
    Fragment,
} = wp.element;
const { __, sprintf } = wp.i18n;
const { apiFetch } = wp;
const { addQueryArgs } = wp.url;

export function rendererPath( block, attributes = null, urlQueryArgs = {} ) {
    return addQueryArgs( 'lazy-blocks/v1/block-render', {
        context: 'editor',
        name: block,
        ...( null !== attributes ? { attributes } : {} ),
        ...urlQueryArgs,
    } );
}

/**
 * Block Editor custom PHP preview.
 *
 * Based on ServerSideRender
 * https://github.com/WordPress/gutenberg/blob/master/packages/components/src/server-side-render/index.js
 */
export class PreviewServerCallback extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            response: null,
            previousResponse: null,
            allowRender: true,
        };
    }

    componentDidMount() {
        this.isStillMounted = true;
        this.fetch( this.props );
        // Only debounce once the initial fetch occurs to ensure that the first
        // renders show data as soon as possible.
        this.fetch = debounce( 500, this.fetch );
    }

    componentWillUnmount() {
        this.isStillMounted = false;
    }

    componentDidUpdate( prevProps ) {
        if ( this.state.allowRender && ! deepEqual( prevProps, this.props ) ) {
            this.fetch( this.props );
        }
    }

    fetch( props ) {
        if ( ! this.isStillMounted ) {
            return;
        }
        if ( null !== this.state.response ) {
            this.setState( { response: null } );
        }
        const { block, attributes = null, urlQueryArgs = {} } = props;

        const path = rendererPath( block, attributes, urlQueryArgs );

        // Store the latest fetch request so that when we process it, we can
        // check if it is the current request, to avoid race conditions on slow networks.
        const fetchRequest = this.currentFetchRequest = apiFetch( { path } )
            .then( ( response ) => {
                if ( this.isStillMounted && fetchRequest === this.currentFetchRequest ) {
                    if ( response && response.success ) {
                        this.setState( {
                            response: response.response,
                            previousResponse: response.response,
                        } );
                    } else if ( response && ! response.success && response.error_code ) {
                        if ( 'lazy_block_invalid' === response.error_code ) {
                            this.setState( {
                                response: null,
                                previousResponse: null,
                            } );
                        } else if ( 'lazy_block_no_render_callback' === response.error_code ) {
                            this.setState( {
                                response: null,
                                previousResponse: null,
                                allowRender: false,
                            } );
                        }
                    }
                }
            } )
            .catch( ( response ) => {
                if ( this.isStillMounted && fetchRequest === this.currentFetchRequest ) {
                    this.setState( {
                        response: {
                            error: true,
                            response,
                        },
                    } );
                }
            } );
        return fetchRequest;
    }

    render() {
        const {
            response,
            previousResponse,
        } = this.state;
        let result = '';

        if ( ! this.state.allowRender ) {
            result = '';
        } else if ( ! response ) {
            result = (
                <Fragment>
                    { previousResponse ? (
                        <RawHTML key="html">{ previousResponse }</RawHTML>
                    ) : '' }
                    <Spinner />
                </Fragment>
            );
        } else if ( response.error ) {
            // translators: %s: error message describing the problem
            const errorMessage = sprintf( __( 'Error loading block preview: %s' ), response.response );
            result = errorMessage;
        } else if ( ! response.length ) {
            result = __( 'No results found.' );
        } else {
            result = <RawHTML key="html">{ response }</RawHTML>;
        }

        return (
            <div className="lzb-preview-server">
                { result }
            </div>
        );
    }
}

export default PreviewServerCallback;
