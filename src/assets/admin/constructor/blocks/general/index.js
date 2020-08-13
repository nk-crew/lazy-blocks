import slugify from 'slugify';

import BlockSlugControl from '../../../components/block-slug';
import IconPicker from '../../../components/icon-picker';
import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    PanelBody,
    BaseControl,
    TextControl,
    TextareaControl,
    Notice,
} = wp.components;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
} = wp.data;

class GeneralSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.maybeAddSlug = this.maybeAddSlug.bind( this );
        this.isSlugValid = this.isSlugValid.bind( this );
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

    isSlugValid() {
        const {
            data,
        } = this.props;

        const {
            slug,
        } = data;

        return /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( `lazyblock/${ slug }` );
    }

    render() {
        const {
            data,
            updateData,
            categories,
            postTitle,
            updatePostTitle,
        } = this.props;

        const {
            slug,
            icon,
            category,
            description,
            keywords,
        } = data;

        let thereIsSelectedCat = false;
        const categoriesOpts = categories.map( ( cat ) => {
            if ( cat.slug === category ) {
                thereIsSelectedCat = true;
            }
            return {
                value: cat.slug,
                label: cat.title,
            };
        } );
        if ( ! thereIsSelectedCat ) {
            categoriesOpts.push( {
                value: category,
                label: category,
            } );
        }

        return (
            <Fragment>
                <PanelBody>
                    <TextControl
                        label={ __( 'Title', '@@text_domain' ) }
                        value={ postTitle }
                        onChange={ ( value ) => updatePostTitle( value ) }
                        onBlur={ () => this.maybeAddSlug() }
                    />
                </PanelBody>
                <PanelBody>
                    <BlockSlugControl
                        label={ __( 'Slug', '@@text_domain' ) }
                        value={ slug }
                        onChange={ ( value ) => updateData( { slug: value } ) }
                    />
                    { slug && ! this.isSlugValid() ? (
                        <Notice
                            status="error"
                            isDismissible={ false }
                            className="lzb-constructor-notice"
                        >
                            { __( 'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block', '@@text_domain' ) }
                        </Notice>
                    ) : '' }
                </PanelBody>
                <PanelBody>
                    <IconPicker
                        label={ __( 'Icon', '@@text_domain' ) }
                        value={ icon }
                        onChange={ ( value ) => updateData( { icon: value } ) }
                    />
                </PanelBody>
                <PanelBody>
                    <BaseControl
                        label={ __( 'Category', '@@text_domain' ) }
                    >
                        <Select
                            isCreatable
                            placeholder={ __( 'Select category', '@@text_domain' ) }
                            value={ categoriesOpts.filter( ( option ) => option.value === category ) }
                            options={ categoriesOpts }
                            onChange={ ( { value } ) => updateData( { category: value } ) }
                        />
                    </BaseControl>
                </PanelBody>
                <PanelBody>
                    <BaseControl
                        label={ __( 'Keywords', '@@text_domain' ) }
                    >
                        <Select
                            isCreatable
                            isTags
                            placeholder={ __( 'Enter up to 3 keywords', '@@text_domain' ) }
                            value={ ( () => {
                                if ( keywords ) {
                                    const result = keywords.split( ',' ).map( ( val ) => ( {
                                        value: val,
                                        label: val,
                                    } ) );
                                    return result;
                                }
                                return [];
                            } )() }
                            onChange={ ( value ) => {
                                let result = '';

                                if ( value ) {
                                    const limitNum = 3;
                                    let i = 0;
                                    value.forEach( ( optionData ) => {
                                        if ( optionData && i < limitNum ) {
                                            i += 1;

                                            if ( result ) {
                                                result += ',';
                                            }

                                            result += optionData.value;
                                        }
                                    } );
                                }

                                updateData( { keywords: result } );
                            } }
                        />
                    </BaseControl>
                </PanelBody>
                <PanelBody>
                    <TextareaControl
                        label={ __( 'Description', '@@text_domain' ) }
                        value={ description }
                        onChange={ ( value ) => updateData( { description: value } ) }
                    />
                </PanelBody>
            </Fragment>
        );
    }
}

export default compose( [
    withSelect( ( select ) => {
        const { getEditedPostAttribute } = select( 'core/editor' );
        const categories = select( 'core/blocks' ).getCategories();

        return {
            postTitle: getEditedPostAttribute( 'title' ),
            categories,
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
] )( GeneralSettings );
