/**
 * External Dependencies
 */
import * as clipboard from 'clipboard-polyfill';

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

import Copied from '../components/copied';

/**
 * Component
 */
class Templates extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            showBlocksPHP: false,
            showTemplatesPHP: false,
            disabledBlocks: {},
            disabledTemplates: {},
            copiedBlocks: false,
            copiedTemplates: false,
        };

        this.renderExportContent = this.renderExportContent.bind( this );
        this.getDownloadJSONUrl = this.getDownloadJSONUrl.bind( this );
        this.getPHPStringCode = this.getPHPStringCode.bind( this );
        this.copyPHPStringCode = this.copyPHPStringCode.bind( this );
    }

    renderExportContent( type = 'blocks' ) {
        const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
        const nothingSelected = Object.keys( this.state[ `disabled${ typeLabel }` ] ).length === data[ type ].length;

        return (
            <Fragment>
                <div className="lzb-export-select-items">
                    <BaseControl>
                        <ToggleControl
                            label={ __( 'Select all', '@@text_domain' ) }
                            checked={ Object.keys( this.state[ `disabled${ typeLabel }` ] ).length === 0 }
                            onChange={ () => {
                                const newDisabled = {};

                                // disable all
                                if ( Object.keys( this.state[ `disabled${ typeLabel }` ] ).length === 0 ) {
                                    data[ type ].forEach( ( item ) => {
                                        newDisabled[ item.data.id ] = true;
                                    } );
                                }

                                this.setState( {
                                    [ `disabled${ typeLabel }` ]: newDisabled,
                                } );
                            } }
                        />
                        { data[ type ].map( ( item ) => {
                            const isSelected = ! this.state[ `disabled${ typeLabel }` ][ item.data.id ];

                            return (
                                <ToggleControl
                                    key={ item.data.id }
                                    label={ (
                                        <Fragment>
                                            { 'blocks' === type ? (
                                                <Fragment>
                                                    { item.data.icon && /^dashicons/.test( item.data.icon ) ? (
                                                        <span className={ item.data.icon } />
                                                    ) : '' }
                                                    { item.data.icon && ! /^dashicons/.test( item.data.icon ) ? (
                                                        <span dangerouslySetInnerHTML={ { __html: item.data.icon } } />
                                                    ) : '' }
                                                    { ' ' }
                                                </Fragment>
                                            ) : '' }
                                            { item.data.title }
                                        </Fragment>
                                    ) }
                                    checked={ isSelected }
                                    onChange={ () => {
                                        const newDisabled = {
                                            ...this.state[ `disabled${ typeLabel }` ],
                                        };

                                        if ( isSelected && ! newDisabled[ item.data.id ] ) {
                                            newDisabled[ item.data.id ] = true;
                                        } else if ( ! isSelected && typeof newDisabled[ item.data.id ] !== 'undefined' ) {
                                            delete newDisabled[ item.data.id ];
                                        }

                                        this.setState( {
                                            [ `disabled${ typeLabel }` ]: newDisabled,
                                        } );
                                    } }
                                />
                            );
                        } ) }
                    </BaseControl>
                </div>

                { this.state[ `show${ typeLabel }PHP` ] ? (
                    <Fragment>
                        <div className="lzb-export-textarea">
                            <TextareaControl
                                className="lzb-export-code"
                                readOnly
                                value={ this.getPHPStringCode( type ) }
                            />
                        </div>
                        <div className="lzb-export-buttons">
                            <button
                                className="button"
                                onClick={ () => {
                                    this.copyPHPStringCode( type );
                                } }
                            >
                                { __( 'Copy to Clipboard', '@@text_domain' ) }
                                { this.state[ `copied${ typeLabel }` ] ? (
                                    <Copied />
                                ) : '' }
                            </button>
                        </div>
                    </Fragment>
                ) : (
                    <div className="lzb-export-buttons">
                        <a
                            className="button button-primary"
                            disabled={ nothingSelected }
                            href={ this.getDownloadJSONUrl( type ) }
                        >
                            { __( 'Export JSON', '@@text_domain' ) }
                        </a>
                        <button
                            className="button"
                            onClick={ () => {
                                this.setState( {
                                    [ `show${ typeLabel }PHP` ]: true,
                                } );
                            } }
                            disabled={ nothingSelected }
                        >
                            { __( 'Generate PHP', '@@text_domain' ) }
                        </button>
                    </div>
                ) }
            </Fragment>
        );
    }

    getDownloadJSONUrl( type = 'blocks' ) {
        const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );
        let url = window.location.href;

        data[ type ].forEach( ( item ) => {
            if ( ! this.state[ `disabled${ typeLabel }` ][ item.data.id ] ) {
                url += `&lazyblocks_export_${ type }[]=${ item.data.id }`;
            }
        } );

        return url;
    }

    /**
     * Get blocks/templates PHP string code depending on checked post types.
     *
     * @param {String} type - blocks or templates.
     *
     * @return {String} code.
     */
    getPHPStringCode( type = 'blocks' ) {
        const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

        let result = '';

        data[ type ].forEach( ( item ) => {
            if ( ! this.state[ `disabled${ typeLabel }` ][ item.data.id ] ) {
                result += item.php_string_code;
            }
        } );

        if ( result ) {
            result = `if ( function_exists( 'lazyblocks' ) ) :\n${ result }\nendif;`;
        }

        return result;
    }

    copyPHPStringCode( type = 'blocks' ) {
        const typeLabel = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

        clipboard.writeText( this.getPHPStringCode( type ) );

        this.setState( {
            [ `copied${ typeLabel }` ]: true,
        } );

        clearTimeout( this[ `copied${ typeLabel }Timeout` ] );

        this[ `copied${ typeLabel }Timeout` ] = setTimeout( () => {
            this.setState( {
                [ `copied${ typeLabel }` ]: false,
            } );
        }, 350 );
    }

    render() {
        return (
            <div className="metabox-holder">
                <div className="postbox-container">
                    <div id="normal-sortables">
                        <div className="postbox-container">
                            <div className="postbox">
                                <h2 className="hndle"><span>{ __( 'Export Blocks', '@@text_domain' ) }</span></h2>
                                { data.blocks && data.blocks.length ? (
                                    <div className="inside">
                                        <p>{ __( 'Select the blocks you would like to export and then select your export method. Use the download button to export to a .json file which you can then import to another Lazy Blocks installation. Use the generate button to export to PHP code which you can place in your theme.' ) }</p>

                                        { this.renderExportContent( 'blocks' ) }
                                    </div>
                                ) : (
                                    <div className="inside">
                                        <p>{ __( 'There are no blocks to export.' ) }</p>
                                    </div>
                                ) }
                            </div>
                            <div className="postbox">
                                <h2 className="hndle"><span>{ __( 'Export Templates', '@@text_domain' ) }</span></h2>
                                { data.templates && data.templates.length ? (
                                    <div className="inside">
                                        <p>{ __( 'Select the templates you would like to export and then select your export method. Use the download button to export to a .json file which you can then import to another Lazy Blocks installation. Use the generate button to export to PHP code which you can place in your theme.' ) }</p>

                                        { this.renderExportContent( 'templates' ) }
                                    </div>
                                ) : (
                                    <div className="inside">
                                        <p>{ __( 'There are no templates to export.' ) }</p>
                                    </div>
                                ) }
                            </div>
                        </div>
                        <div className="postbox-container">
                            <div className="postbox">
                                <h2 className="hndle"><span>{ __( 'Import', '@@text_domain' ) }</span></h2>
                                <div className="inside">
                                    <p>{ __( 'Select the Lazy Blocks JSON file you would like to import. When you click the import button below, Lazy Blocks will import the blocks or templates.' ) }</p>

                                    <form method="post" encType="multipart/form-data">
                                        <div className="lzb-export-select-items">
                                            <input type="file" name="lzb_tools_import_json" />
                                        </div>

                                        <input type="hidden" name="lzb_tools_import_nonce" value={ data.nonce } />

                                        <div className="lzb-export-buttons">
                                            <button className="button button-primary">
                                                { __( 'Import', '@@text_domain' ) }
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Templates;
