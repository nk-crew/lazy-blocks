import slugify from 'slugify';

import './editor.scss';

const { __ } = wp.i18n;

const {
    Component,
} = wp.element;

const {
    TextControl,
} = wp.components;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
} = wp.data;

class TitleSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.maybeAddSlug = this.maybeAddSlug.bind( this );
    }

    maybeAddSlug() {
        const {
            data,
            updateData,
            postTitle,
        } = this.props;

        const {
            slug,
        } = data;

        if ( slug || ! postTitle ) {
            return;
        }

        const newSlug = slugify( postTitle, {
            replacement: '-',
            lower: true,
            remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
        } );

        updateData( {
            slug: newSlug,
        } );
    }

    render() {
        const self = this;
        const {
            postTitle,
            updatePostTitle,
        } = self.props;

        return (
            <div className="lzb-constructor-title">
                <TextControl
                    placeholder={ __( 'Block Name', '@@text_domain' ) }
                    value={ postTitle }
                    onChange={ ( value ) => updatePostTitle( value ) }
                    onBlur={ () => this.maybeAddSlug() }
                />
            </div>
        );
    }
}

export default compose( [
    withSelect( ( select ) => {
        const { getEditedPostAttribute } = select( 'core/editor' );

        return {
            postTitle: getEditedPostAttribute( 'title' ),
        };
    } ),
    withDispatch( ( dispatch ) => {
        const {
            editPost,
        } = dispatch( 'core/editor' );

        return {
            updatePostTitle( title ) {
                editPost( { title } );
            },
        };
    } ),
] )( TitleSettings );
