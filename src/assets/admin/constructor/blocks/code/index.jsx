import CodeEditor from '../../../components/code-editor';

import './editor.scss';

const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    BaseControl,
    SelectControl,
    CheckboxControl,
    Button,
    Popover,
    TabPanel,
} = wp.components;

export default class CustomCodeSettings extends Component {
    constructor() {
        super( ...arguments );

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
                mode={ data.code_use_php ? 'php' : 'html' }
                onChange={ value => updateData( { [ metaName ]: value } ) }
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
        } = this.props;

        const {
            showInfo,
        } = this.state;

        // add ajax check for filter
        //
        // has_filter( $block_slug . '/frontend_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s' ), '<code>' . $block_slug . '/frontend_callback</code>' )
        //
        //
        // has_filter( $block_slug . '/editor_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s' ), '<code>' . $block_slug . '/editor_callback</code>' )

        const tabs = [ {
            name: 'frontend',
            title: __( 'Frontend' ),
            className: 'lazyblocks-control-tabs-tab',
        } ];

        if ( 'never' !== data.code_show_preview && ! data.code_single_output ) {
            tabs.push( {
                name: 'editor',
                title: __( 'Editor' ),
                className: 'lazyblocks-control-tabs-tab',
            } );
        }

        return (
            <div className="lzb-constructor-custom-code-settings">
                { tabs.length > 1 ? (
                    <BaseControl>
                        <TabPanel
                            className="lazyblocks-control-tabs"
                            activeClass="is-active"
                            tabs={ tabs }
                        >
                            {
                                ( tab ) => {
                                    return this.getEditor( tab.name );
                                }
                            }
                        </TabPanel>
                    </BaseControl>
                ) : (
                    <BaseControl>
                        { this.getEditor( 'frontend' ) }
                    </BaseControl>
                ) }

                <BaseControl>
                    <Button
                        isDefault
                        onClick={ () => {
                            if ( ! showInfo ) {
                                this.setState( { showInfo: true } );
                            }
                        } }
                    >
                        { __( 'How to use?' ) }
                        { showInfo ? (
                            <Popover
                                className="lzb-constructor-custom-code-settings-popover"
                                focusOnMount={ false }
                                onClickOutside={ () => {
                                    this.setState( { showInfo: false } );
                                } }
                            >
                                <p className="description">
                                    { __( 'Simple text field example see here:' ) } <a href="https://lazyblocks.com/documentation/blocks-controls/text/" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-controls/text/</a>
                                </p>
                                <hr />
                                <p className="description">
                                    { __( 'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.' ) }
                                </p>
                                <p className="description">
                                    { __( 'Note 2: supported custom PHP callback to output block' ) } <a href="https://lazyblocks.com/documentation/blocks-code/php-callback/" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-code/php-callback/</a>.
                                </p>
                            </Popover>
                        ) : '' }
                    </Button>
                </BaseControl>

                <BaseControl
                    label={ __( 'Single output code for Frontend and Editor' ) }
                >
                    <CheckboxControl
                        label={ __( 'Yes' ) }
                        checked={ data.code_single_output }
                        onChange={ value => updateData( { code_single_output: value } ) }
                    />
                </BaseControl>

                <BaseControl
                    label={ __( 'Output Method' ) }
                >
                    <SelectControl
                        options={ [
                            {
                                label: __( 'HTML + Handlebars' ),
                                value: 'html',
                            }, {
                                label: __( 'PHP' ),
                                value: 'php',
                            },
                        ] }
                        value={ data.code_use_php ? 'php' : 'html' }
                        onChange={ value => updateData( { code_use_php: value === 'php' } ) }
                    />
                </BaseControl>

                <BaseControl
                    label={ __( 'Show block preview in editor' ) }
                >
                    <SelectControl
                        options={ [
                            {
                                label: __( 'Always' ),
                                value: 'always',
                            }, {
                                label: __( 'Within `selected` block only' ),
                                value: 'selected',
                            }, {
                                label: __( 'Within `unselected` block only' ),
                                value: 'unselected',
                            }, {
                                label: __( 'Never' ),
                                value: 'never',
                            },
                        ] }
                        value={ data.code_show_preview }
                        onChange={ value => updateData( { code_show_preview: value } ) }
                    />
                </BaseControl>
            </div>
        );
    }
}
