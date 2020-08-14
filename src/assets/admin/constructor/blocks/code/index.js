import CodeEditor from '../../../components/code-editor';

import './editor.scss';

const { __ } = wp.i18n;

const {
    Fragment,
    Component,
} = wp.element;

const {
    withSelect,
} = wp.data;

const {
    PanelBody,
    BaseControl,
    SelectControl,
    CheckboxControl,
    RadioControl,
    Button,
    TabPanel,
    Notice,
} = wp.components;

class CustomCodeSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            showInfo: false,
        };

        this.getEditor = this.getEditor.bind( this );
    }

    getEditor( name = 'frontend' ) {
        const {
            data,
            updateData,
        } = this.props;

        const metaName = `code_${ name }_html`;

        return (
            <CodeEditor
                key={ metaName + data.code_output_method }
                mode={ data.code_output_method }
                onChange={ ( value ) => updateData( { [ metaName ]: value } ) }
                value={ data[ metaName ] }
                maxLines={ 20 }
                minLines={ 5 }
                height="300px"
            />
        );
    }

    render() {
        const {
            data,
            updateData,
            currentTheme,
        } = this.props;

        const {
            showInfo,
        } = this.state;

        // add ajax check for filter
        //
        // has_filter( $block_slug . '/frontend_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s', '@@text_domain' ), '<code>' . $block_slug . '/frontend_callback</code>' )
        //
        //
        // has_filter( $block_slug . '/editor_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s', '@@text_domain' ), '<code>' . $block_slug . '/editor_callback</code>' )

        const tabs = [ {
            name: 'frontend',
            title: __( 'Frontend', '@@text_domain' ),
            className: 'lazyblocks-control-tabs-tab',
        } ];

        if ( 'never' !== data.code_show_preview && ! data.code_single_output ) {
            tabs.push( {
                name: 'editor',
                title: __( 'Editor', '@@text_domain' ),
                className: 'lazyblocks-control-tabs-tab',
            } );
        }

        return (
            <div className="lzb-constructor-custom-code-settings">
                <PanelBody>
                    <BaseControl
                        label={ __( 'Output Method', '@@text_domain' ) }
                    >
                        <RadioControl
                            options={ [
                                {
                                    label: __( 'HTML + Handlebars', '@@text_domain' ),
                                    value: 'html',
                                }, {
                                    label: __( 'PHP', '@@text_domain' ),
                                    value: 'php',
                                }, {
                                    label: __( 'Theme Template', '@@text_domain' ),
                                    value: 'template',
                                },
                            ] }
                            selected={ data.code_output_method || 'html' }
                            onChange={ ( value ) => updateData( { code_output_method: value } ) }
                        />
                    </BaseControl>
                </PanelBody>

                { /* Code Editor */ }
                { 'template' !== data.code_output_method ? (
                    <Fragment>
                        <PanelBody>
                            { 1 < tabs.length ? (
                                <BaseControl>
                                    <TabPanel
                                        className="lazyblocks-control-tabs"
                                        activeClass="is-active"
                                        tabs={ tabs }
                                    >
                                        {
                                            ( tab ) => this.getEditor( tab.name )
                                        }
                                    </TabPanel>
                                </BaseControl>
                            ) : (
                                <BaseControl>
                                    { this.getEditor( 'frontend' ) }
                                </BaseControl>
                            ) }
                            <BaseControl>
                                { ! showInfo ? (
                                    <Button
                                        isLink
                                        onClick={ () => {
                                            this.setState( { showInfo: true } );
                                        } }
                                    >
                                        { __( 'How to use?', '@@text_domain' ) }
                                    </Button>
                                ) : (
                                    <Notice
                                        status="info"
                                        isDismissible={ false }
                                        className="lzb-constructor-notice"
                                    >
                                        <p className="description">
                                            { __( 'Simple text field example see here:', '@@text_domain' ) }
                                            { ' ' }
                                            <a href="https://lazyblocks.com/documentation/blocks-controls/text/" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-controls/text/</a>
                                        </p>
                                        <hr />
                                        <p className="description">
                                            { __( 'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.', '@@text_domain' ) }
                                        </p>
                                        <p className="description">
                                            { __( 'Note 2: supported custom PHP callback to output block', '@@text_domain' ) }
                                            { ' ' }
                                            <a href="https://lazyblocks.com/documentation/blocks-code/php-callback/" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-code/php-callback/</a>
                                            .
                                        </p>
                                    </Notice>
                                ) }
                            </BaseControl>
                        </PanelBody>

                        <PanelBody>
                            <BaseControl>
                                <CheckboxControl
                                    label={ __( 'Single output code for Frontend and Editor', '@@text_domain' ) }
                                    checked={ data.code_single_output }
                                    onChange={ ( value ) => updateData( { code_single_output: value } ) }
                                />
                            </BaseControl>
                        </PanelBody>
                    </Fragment>
                ) : '' }

                { /* Information about Theme Template usage */ }
                { 'template' === data.code_output_method && currentTheme && currentTheme.stylesheet ? (
                    <PanelBody>
                        <Notice
                            status="info"
                            isDismissible={ false }
                            className="lzb-constructor-notice lzb-constructor-notice-theme-template"
                        >
                            <p className="description">
                                { __( 'To output block code, Lazy Blocks will look for template file in your theme directory:', '@@text_domain' ) }
                            </p>
                            <code>
                                { `/wp-content/themes/${ currentTheme.stylesheet }/blocks/` }
                                <span>
                                    { `lazyblock-${ data.slug }` }
                                </span>
                                /block.php
                            </code>
                            <p className="description">
                                { __( 'Read more:', '@@text_domain' ) }
                                { ' ' }
                                <a href="https://lazyblocks.com/documentation/blocks-code/theme-template/" target="_blank" rel="noopener noreferrer">
                                    { __( 'How to use theme template', '@@text_domain' ) }
                                </a>
                            </p>
                        </Notice>
                    </PanelBody>
                ) : '' }

                <PanelBody>
                    <BaseControl
                        label={ __( 'Show block preview in editor', '@@text_domain' ) }
                    >
                        <SelectControl
                            options={ [
                                {
                                    label: __( 'Always', '@@text_domain' ),
                                    value: 'always',
                                }, {
                                    label: __( 'Within `selected` block only', '@@text_domain' ),
                                    value: 'selected',
                                }, {
                                    label: __( 'Within `unselected` block only', '@@text_domain' ),
                                    value: 'unselected',
                                }, {
                                    label: __( 'Never', '@@text_domain' ),
                                    value: 'never',
                                },
                            ] }
                            value={ data.code_show_preview }
                            onChange={ ( value ) => updateData( { code_show_preview: value } ) }
                        />
                    </BaseControl>
                </PanelBody>
            </div>
        );
    }
}

export default withSelect( ( select ) => {
    const {
        getCurrentTheme,
    } = select( 'core' );

    return {
        currentTheme: getCurrentTheme(),
    };
} )( CustomCodeSettings );
