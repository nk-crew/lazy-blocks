import BlockSlugControl from '../../components/block-slug';
import IconPicker from '../../components/icon-picker';
import Select from '../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    BaseControl,
    TextControl,
    TextareaControl,
} = wp.components;

const { compose } = wp.compose;

const {
    withSelect,
    withDispatch,
} = wp.data;

class GeneralSettings extends Component {
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
                <TextControl
                    label={ __( 'Title' ) }
                    value={ postTitle }
                    onChange={ ( value ) => updatePostTitle( value ) }
                />
                <div className="lzb-constructor-grid">
                    <div>
                        <BlockSlugControl
                            label={ __( 'Slug' ) }
                            value={ slug }
                            onChange={ ( value ) => updateData( { slug: value } ) }
                        />
                    </div>
                    <div>
                        <IconPicker
                            label={ __( 'Icon' ) }
                            value={ icon }
                            onChange={ ( value ) => updateData( { icon: value } ) }
                        />
                    </div>
                </div>
                <div className="lzb-constructor-grid">
                    <div>
                        <BaseControl
                            label={ __( 'Category' ) }
                        >
                            <Select
                                isCreatable
                                placeholder={ __( 'Select category' ) }
                                value={ categoriesOpts.filter( option => option.value === category ) }
                                options={ categoriesOpts }
                                onChange={ ( { value } ) => updateData( { category: value } ) }
                            />
                        </BaseControl>
                    </div>
                    <div>
                        <BaseControl
                            label={ __( 'Keywords' ) }
                        >
                            <Select
                                isCreatable
                                isTags
                                placeholder={ __( 'Enter up to 3 keywords' ) }
                                value={ ( () => {
                                    if ( keywords ) {
                                        const result = keywords.split( ',' ).map( ( val ) => {
                                            return {
                                                value: val,
                                                label: val,
                                            };
                                        } );
                                        return result;
                                    }
                                    return [];
                                } )() }
                                onChange={ ( value ) => {
                                    let result = '';

                                    const limitNum = 3;
                                    let i = 0;
                                    value.forEach( ( optionData ) => {
                                        if ( optionData && i < limitNum ) {
                                            i++;
                                            if ( result ) {
                                                result += ',';
                                            }
                                            result += optionData.value;
                                        }
                                    } );

                                    updateData( { keywords: result } );
                                } }
                            />
                        </BaseControl>
                    </div>
                </div>
                <TextareaControl
                    label={ __( 'Description' ) }
                    value={ description }
                    onChange={ ( value ) => updateData( { description: value } ) }
                />
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
