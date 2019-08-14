/**
 * Styles
 */
import './style.scss';

/**
 * External Dependencies
 */
import { components } from 'react-select';
import classnames from 'classnames/dedupe';
const { Option } = components;

/**
 * Internal Dependencies
 */
import Select from '../components/select';

/**
 * WordPress Dependencies
 */
const {
    __,
    sprintf,
} = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const {
    BaseControl,
} = wp.components;

const { compose } = wp.compose;

const {
    withSelect,
} = wp.data;

const {
    getBlockTypes,
    getCategories,
} = wp.blocks;

const {
    apiFetch,
} = wp;

/**
 * Component
 */
class Templates extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            search: '',
            templates: false,
            blocks: false,
            blocksCategorized: [],
        };

        this.getIcon = this.getIcon.bind( this );
        this.getTemplateDataFromPost = this.getTemplateDataFromPost.bind( this );
        this.prepareAllBlocks = this.prepareAllBlocks.bind( this );
        this.fetchTemplates = this.fetchTemplates.bind( this );
        this.getTemplateKey = this.getTemplateKey.bind( this );
        this.getTemplate = this.getTemplate.bind( this );
        this.addTemplate = this.addTemplate.bind( this );
        this.updateTemplateData = this.updateTemplateData.bind( this );
        this.saveTemplate = this.saveTemplate.bind( this );
        this.removeTemplate = this.removeTemplate.bind( this );
        this.addBlockToTemplate = this.addBlockToTemplate.bind( this );
        this.removeBlockFromTemplate = this.removeBlockFromTemplate.bind( this );
    }

    /**
     * Get Icon React Component.
     *
     * @param {Object} data icon data.
     *
     * @return {JSX} icon.
     */
    getIcon( data ) {
        let icon = data.src ? data.src : data;

        // Prepare icon.
        if ( typeof icon === 'function' ) {
            icon = icon();
        } else if ( typeof icon === 'string' ) {
            icon = wp.element.createElement( wp.components.Dashicon, { icon: icon } );
        }

        return icon;
    }

    /**
     * Get Template data from Post data.
     *
     * @param {Object} postData post data.
     *
     * @return {Object} template data.
     */
    getTemplateDataFromPost( postData ) {
        const availableBlocks = getBlockTypes();
        let meta;

        try {
            meta = JSON.parse( decodeURI( postData.meta.lzb_template_data ) );
        } catch ( e ) {
            meta = {};
        }

        if ( ! meta.blocks ) {
            meta.blocks = [];
        }

        // prepare selected blocks.
        meta.blocks.forEach( ( val, k ) => {
            meta.blocks[ k ].title = __( 'Undefined Block' );

            let availableBlock = false;

            availableBlocks.forEach( ( block ) => {
                if ( availableBlock ) {
                    return;
                }

                if ( block.name === val.name ) {
                    availableBlock = block;
                }
            } );

            if ( availableBlock ) {
                meta.blocks[ k ] = availableBlock;

                // if block is not available, prepare Undefined block.
            } else {
                meta.blocks[ k ].icon = (
                    <svg aria-hidden="true" role="img" focusable="false" className="dashicon dashicons-warning" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8zm1.13 9.38l.35-6.46H8.52l.35 6.46h2.26zm-.09 3.36c.24-.23.37-.55.37-.96 0-.42-.12-.74-.36-.97s-.59-.35-1.06-.35-.82.12-1.07.35-.37.55-.37.97c0 .41.13.73.38.96.26.23.61.34 1.06.34s.8-.11 1.05-.34z"></path></svg>
                );
                meta.blocks[ k ].class = 'lzb-templates-single-blocks-undefined';
            }
        } );

        return {
            ID: postData.id,
            post_type: meta.post_type || 'post',
            post_label: meta.post_label || meta.post_type || 'post',
            blocks: meta.blocks,
            template_lock: meta.template_lock || '',
            is_changed: false,
        };
    }

    /**
     * Prepare all available blocks and save in state.
     */
    prepareAllBlocks() {
        const availableBlocks = getBlockTypes();
        const availableCategories = getCategories();
        const blocks = [];
        const blocksCategorizedObj = {};

        // prepare lazyblocks category to appear in the start of the list.
        blocksCategorizedObj.lazyblocks = {
            label: 'Lazy Blocks',
            options: [],
        };

        // prepare categories list.
        availableCategories.forEach( ( cat ) => {
            blocksCategorizedObj[ cat.slug ] = {
                label: cat.title,
                options: [],
            };
        } );

        // prepare blocks list.
        availableBlocks.forEach( ( block ) => {
            if (
                // prevent adding blocks with parent option (fe Grid Column).
                ! ( block.parent && block.parent.length ) &&

                // prevent showing blocks with disabled inserter.
                // allow only lazyblocks free block.
                ! (
                    block.name !== 'lazyblock-core/free' &&
                    ( block.supports && typeof block.supports.inserter !== 'undefined' && ! block.supports.inserter )
                )
            ) {
                blocks[ block.name ] = {
                    name: block.name,
                    label: block.title,
                    icon: this.getIcon( block.icon ),
                    category: block.category,
                    useOnce: block.supports && typeof block.supports.multiple !== 'undefined' ? block.supports.multiple : true,
                };
                blocksCategorizedObj[ block.category ].options.push( blocks[ block.name ] );
            }
        } );

        this.setState( {
            blocks,
            blocksCategorized: Object.keys( blocksCategorizedObj ).map( ( k ) => {
                return blocksCategorizedObj[ k ];
            } ),
        } );
    }

    /**
     * Fetch all available template and save in state.
     */
    async fetchTemplates() {
        const fetchedTemplates = await apiFetch( { path: '/wp/v2/lazyblocks_templates?per_page=-1' } );
        let templates = [];

        if ( fetchedTemplates && fetchedTemplates.length ) {
            templates = fetchedTemplates.map( ( data ) => {
                return this.getTemplateDataFromPost( data );
            } );
        }

        this.setState( {
            templates,
        } );
    }

    /**
     * Get template key by post ID.
     *
     * @param {Int} ID post id.
     *
     * @return {Int} key.
     */
    getTemplateKey( ID ) {
        const {
            templates,
        } = this.state;

        let result = false;

        templates.forEach( ( data, k ) => {
            if ( result !== false ) {
                return;
            }

            if ( data.ID === ID ) {
                result = k;
            }
        } );

        return result;
    }

    /**
     * Get template data by post ID.
     *
     * @param {Int} ID post id.
     *
     * @return {Object} template data.
     */
    getTemplate( ID ) {
        const {
            templates,
        } = this.state;

        const key = this.getTemplateKey( ID );

        return templates[ key ] || false;
    }

    /**
     * Add new template.
     *
     * @param {Object} post post data.
     */
    addTemplate( post ) {
        const {
            templates,
        } = this.state;

        // add to DB.
        apiFetch( {
            path: '/wp/v2/lazyblocks_templates/',
            method: 'POST',
            data: {
                title: post.name,
                status: 'publish',
                meta: {
                    lzb_template_data: encodeURI( JSON.stringify( {
                        post_type: post.slug,
                        post_label: post.name,
                        template_lock: '',
                        blocks: [],
                    } ) ),
                },
            },
        } ).then( ( postData ) => {
            if ( postData && postData.id ) {
                this.setState( {
                    templates: [
                        this.getTemplateDataFromPost( postData ),
                        ...templates,
                    ],
                } );
            }
        } );
    }

    /**
     * Update template data.
     *
     * @param {Int} ID post id.
     * @param {Object} data new template data.
     */
    updateTemplateData( ID, data ) {
        const {
            templates,
        } = this.state;

        const key = this.getTemplateKey( ID );
        const template = this.getTemplate( ID );

        if ( ! template ) {
            return;
        }

        const updatedTemplates = [ ...templates ];

        updatedTemplates[ key ] = {
            ...updatedTemplates[ key ],
            is_changed: true,
            ...data,
        };

        // update in state.
        this.setState( {
            templates: updatedTemplates,
        } );
    }

    /**
     * Save template data in DB.
     *
     * @param {Int} ID post id.
     */
    saveTemplate( ID ) {
        const template = this.getTemplate( ID );

        if ( ! template ) {
            return;
        }

        const blocks = template.blocks.map( ( data ) => {
            return {
                name: data.name,
            };
        } );

        // update in DB.
        apiFetch( {
            path: `/wp/v2/lazyblocks_templates/${ template.ID }`,
            method: 'PUT',
            data: {
                meta: {
                    lzb_template_data: encodeURI( JSON.stringify( {
                        post_type: template.post_type,
                        post_label: template.post_label,
                        template_lock: template.template_lock,
                        blocks: blocks,
                    } ) ),
                },
            },
        } );

        this.updateTemplateData( ID, { is_changed: false } );
    }

    /**
     * Remove template by ID.
     *
     * @param {Int} ID post id.
     */
    removeTemplate( ID ) {
        const {
            templates,
        } = this.state;

        const key = this.getTemplateKey( ID );
        const template = this.getTemplate( ID );

        if ( ! template ) {
            return;
        }

        // remove from DB.
        apiFetch( {
            path: `/wp/v2/lazyblocks_templates/${ template.ID }?force=true`,
            method: 'DELETE',
        } );

        // remove from state.
        this.setState( {
            templates: templates.filter( ( data, i ) => {
                return i !== key;
            } ),
        } );
    }

    /**
     * Add block to template.
     *
     * TODO: prevent add it twice if the block has disabled 'multiple' support
     *
     * @param {Int} ID template post ID.
     * @param {String} blockSlug block data.
     */
    addBlockToTemplate( ID, blockSlug ) {
        const {
            blocks,
        } = this.state;

        const template = this.getTemplate( ID );
        let newBlockData = false;

        if ( template && blocks[ blockSlug ] ) {
            const availableBlocks = getBlockTypes();
            availableBlocks.forEach( ( block ) => {
                if ( newBlockData ) {
                    return;
                }

                if ( block.name === blockSlug ) {
                    newBlockData = block;
                }
            } );
        }

        if ( newBlockData ) {
            this.updateTemplateData( ID, {
                blocks: [
                    ...template.blocks,
                    newBlockData,
                ],
            } );
        }
    }

    /**
     * Remove block from template.
     *
     * @param {Int} ID template post ID.
     * @param {String} blockKey block key in blocks array.
     */
    removeBlockFromTemplate( ID, blockKey ) {
        const template = this.getTemplate( ID );

        if ( template.blocks[ blockKey ] ) {
            this.updateTemplateData( ID, {
                blocks: [
                    ...template.blocks.filter( ( data, k ) => {
                        return blockKey !== k;
                    } ),
                ],
            } );
        }
    }

    componentDidMount() {
        this.prepareAllBlocks();
        this.fetchTemplates();
    }

    render() {
        const {
            postTypes,
        } = this.props;

        const {
            templates,
            blocks,
            blocksCategorized,
        } = this.state;

        if ( false === templates || false === blocks ) {
            return (
                <span className="spinner is-active" />
            );
        }

        const templateLockOptions = [
            {
                label: __( 'None' ),
                value: '',
            }, {
                label: __( 'Prevent all operations' ),
                value: 'all',
            }, {
                label: __( 'Prevent inserting new blocks, but allows moving existing ones' ),
                value: 'insert',
            },
        ];

        return (
            <Fragment>
                { postTypes && postTypes.length ? (
                    <Fragment>
                        <div className="lzb-templates-label">
                            { __( 'Select post type:' ) }
                        </div>
                        <div className="lzb-templates-buttons">
                            { postTypes.filter( ( post ) => {
                                return post.viewable && 'lazyblocks' !== post.slug && 'lazyblocks_templates' !== post.slug && 'attachment' !== post.slug;
                            } ).map( ( post ) => {
                                let label = post.label;
                                let isDisabled = false;

                                if ( post.labels && post.labels.singular_name ) {
                                    label = post.labels.singular_name;
                                }

                                templates.forEach( ( data ) => {
                                    if ( data.post_type === post.slug ) {
                                        isDisabled = true;
                                    }
                                } );

                                return (
                                    <button
                                        key={ post.slug }
                                        className="button button-secondary"
                                        disabled={ isDisabled }
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            this.addTemplate( post );
                                        } }
                                    >
                                        { label }
                                    </button>
                                );
                            } ) }
                        </div>
                    </Fragment>
                ) : '' }
                { templates.length ? (
                    <div className="lzb-templates-list">
                        { templates.map( ( data, k ) => {
                            return (
                                <Fragment key={ `${ data.post_type }-${ k }` }>
                                    <div className="lzb-templates-single">
                                        <div className="lzb-templates-single-header">
                                            <h2>{ data.post_label }</h2>
                                        </div>
                                        <BaseControl>
                                            { data.blocks && data.blocks.length ? (
                                                <table className="lzb-templates-single-blocks widefat fixed striped">
                                                    <thead>
                                                        <tr>
                                                            <td className="check-column"></td>
                                                            <th scope="col">{ __( 'Block Name' ) }</th>
                                                            <th scope="col">{ __( 'Slug' ) }</th>
                                                            <th scope="col" className="column-categories">{ __( 'Category' ) }</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody id="the-list">
                                                        { data.blocks.map( ( block, i ) => (
                                                            <tr
                                                                key={ `${ block.name }-${ k }-${ i }` }
                                                                className={ classnames( 'lzb-templates-single-blocks-block', block.class ) }
                                                            >
                                                                <td>
                                                                    <span className="lzb-templates-single-blocks-block-icon">
                                                                        { this.getIcon( block.icon ) }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <strong>{ block.title }</strong>
                                                                    <div className="row-actions">
                                                                        <span className="trash">
                                                                            { /* eslint-disable-next-line */ }
                                                                            <a
                                                                                href="#"
                                                                                onClick={ ( e ) => {
                                                                                    e.preventDefault();

                                                                                    this.removeBlockFromTemplate( data.ID, i );
                                                                                } }
                                                                            >
                                                                                { __( 'Remove' ) }
                                                                            </a>
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td>{ block.name }</td>
                                                                <td>{ block.category }</td>
                                                            </tr>
                                                        ) ) }
                                                    </tbody>
                                                </table>
                                            ) : '' }
                                            <Select
                                                placeholder={ __( '+ Add Block' ) }
                                                options={ blocksCategorized }
                                                value={ [] }
                                                onChange={ ( { name } ) => {
                                                    this.addBlockToTemplate( data.ID, name );
                                                } }
                                                components={ {
                                                    Option: ( props ) => (
                                                        <Option { ...props }>
                                                            { props.data.icon && <span className="lzb-metabox-select-option-icon">{ props.data.icon }</span> }
                                                            { props.data.label }
                                                        </Option>
                                                    ),
                                                } }
                                            />
                                        </BaseControl>
                                        <BaseControl
                                            label={ __( 'Template Lock' ) }
                                        >
                                            <Select
                                                options={ templateLockOptions }
                                                value={ ( () => {
                                                    let result = [];

                                                    templateLockOptions.forEach( ( opt ) => {
                                                        if ( data.template_lock === opt.value ) {
                                                            result = opt;
                                                        }
                                                    } );

                                                    return result;
                                                } )() }
                                                onChange={ ( { value } ) => {
                                                    this.updateTemplateData( data.ID, {
                                                        template_lock: value,
                                                    } );
                                                } }
                                            />
                                        </BaseControl>
                                        <div className="lzb-templates-single-footer">
                                            <div className="lzb-templates-single-actions row-actions">
                                                <button
                                                    className="button button-primary lzb-templates-single-actions-save"
                                                    disabled={ ! data.is_changed }
                                                    onClick={ ( e ) => {
                                                        e.preventDefault();
                                                        this.saveTemplate( data.ID );
                                                    } }
                                                >
                                                    { __( 'Save Template' ) }
                                                </button>
                                                <span className="trash">
                                                    { /* eslint-disable-next-line */ }
                                                    <a
                                                        href="#"
                                                        onClick={ ( e ) => {
                                                            e.preventDefault();

                                                            // eslint-disable-next-line
                                                            if ( window.confirm( sprintf( __( 'Do you really want to remove template for "%s"?' ), data.post_label ) ) ) {
                                                                this.removeTemplate( data.ID );
                                                            }
                                                        } }
                                                    >
                                                        { __( 'Remove' ) }
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Fragment>
                            );
                        } ) }
                    </div>
                ) : '' }
            </Fragment>
        );
    }
}

export default compose( [
    withSelect( ( select ) => {
        return {
            postTypes: select( 'core' ).getPostTypes( {
                show_ui: true,
            } ),
        };
    } ),
] )( Templates );
