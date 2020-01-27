/**
 * Styles
 */
import './style.scss';

/**
 * Internal Dependencies
 */
const {
    lazyblocksToolsData: data,
} = window;

/**
 * WordPress Dependencies
 */
const {
    __,
} = wp.i18n;

const {
    Component,
    Fragment,
} = wp.element;

const {
    BaseControl,
    TextareaControl,
    ToggleControl,
} = wp.components;

/**
 * Component
 */
class Templates extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            disabledBlocks: {},
            disabledTemplates: {},
        };

        this.getBlockPHPStringCode = this.getBlockPHPStringCode.bind( this );
        this.getTemplatePHPStringCode = this.getTemplatePHPStringCode.bind( this );
    }

    /**
     * Get block PHP string code depending on checked blocks.
     *
     * @return {String} code.
     */
    getBlockPHPStringCode() {
        let result = '';

        data.blocks.forEach( ( block ) => {
            if ( ! this.state.disabledBlocks[ block.data.id ] ) {
                result += block.php_string_code;
            }
        } );

        if ( result ) {
            result = `if ( function_exists( 'lazyblocks' ) ) :\n${ result }\nendif;`;
        }

        return result;
    }

    /**
     * Get template PHP string code depending on checked post types.
     *
     * @return {String} code.
     */
    getTemplatePHPStringCode() {
        let result = '';

        data.templates.forEach( ( template ) => {
            if ( ! this.state.disabledTemplates[ template.data.id ] ) {
                result += template.php_string_code;
            }
        } );

        if ( result ) {
            result = `if ( function_exists( 'lazyblocks' ) ) :\n${ result }\nendif;`;
        }

        return result;
    }

    render() {
        return (
            <div className="postbox">
                <h2 className="hndle"><span>{ __( 'Export', '@@text_domain' ) }</span></h2>
                <div className="inside">
                    <p>{ __( 'You can export PHP code and use it in the theme/plugin to register a local version of generated blocks and templates. A local field group can provide many benefits such as faster load times, version control & dynamic blocks/templates. Simply copy and paste the following code to your theme\'s functions.php file or include it within an external file.', '@@text_domain' ) }</p>

                    <div className="lzb-export-textarea">
                        <div>
                            <TextareaControl
                                className="lzb-export-code"
                                label={ __( 'Blocks', '@@text_domain' ) }
                                readOnly
                                value={ this.getBlockPHPStringCode() }
                            />
                            { data.blocks && data.blocks.length ? (
                                <BaseControl label={ __( 'Select Specific Blocks:', '@@text_domain' ) }>
                                    { data.blocks.map( ( block ) => {
                                        const isSelected = ! this.state.disabledBlocks[ block.data.id ];

                                        return (
                                            <ToggleControl
                                                key={ block.data.id }
                                                label={ (
                                                    <Fragment>
                                                        { block.data.icon ? (
                                                            <span className={ block.data.icon } />
                                                        ) : '' }
                                                        { ' ' }
                                                        { block.data.title }
                                                    </Fragment>
                                                ) }
                                                checked={ isSelected }
                                                onChange={ () => {
                                                    this.setState( {
                                                        disabledBlocks: {
                                                            ...this.state.disabledBlocks,
                                                            [ block.data.id ]: !! isSelected,
                                                        },
                                                    } );
                                                } }
                                            />
                                        );
                                    } ) }
                                </BaseControl>
                            ) : '' }
                        </div>
                        <div>
                            <TextareaControl
                                className="lzb-export-code"
                                label={ __( 'Templates', '@@text_domain' ) }
                                readOnly
                                value={ this.getTemplatePHPStringCode() }
                            />
                            { data.templates && data.templates.length ? (
                                <BaseControl label={ __( 'Select Specific Templates:', '@@text_domain' ) }>
                                    { data.templates.map( ( template ) => {
                                        const isSelected = ! this.state.disabledTemplates[ template.data.id ];

                                        return (
                                            <ToggleControl
                                                key={ template.data.id }
                                                label={ (
                                                    <Fragment>
                                                        { template.data.title }
                                                    </Fragment>
                                                ) }
                                                checked={ isSelected }
                                                onChange={ () => {
                                                    this.setState( {
                                                        disabledTemplates: {
                                                            ...this.state.disabledTemplates,
                                                            [ template.data.id ]: !! isSelected,
                                                        },
                                                    } );
                                                } }
                                            />
                                        );
                                    } ) }
                                </BaseControl>
                            ) : '' }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Templates;
