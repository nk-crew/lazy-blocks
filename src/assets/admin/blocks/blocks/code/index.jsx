import CodeEditor from '../../../components/code-editor';
import Tabs from '../../../components/tabs';

import './editor.scss';

const { __ } = wp.i18n;

const { Component } = wp.element;

const {
    BaseControl,
    SelectControl,
    CheckboxControl,
    Button,
    Popover,
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
                mode="html"
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
            title: __( 'HTML' ),
        } ];

        if ( 'never' !== data.code_show_preview && ! data.code_single_output ) {
            tabs[ 0 ].title = __( 'Frontend HTML' );

            tabs.push( {
                name: 'editor',
                title: __( 'Editor HTML' ),
            } );
        }

        return (
            <div className="lzb-constructor-custom-code-settings">
                { tabs.length > 1 ? (
                    <Tabs tabs={ tabs }>
                        { ( tabData ) => {
                            return this.getEditor( tabData.name );
                        } }
                    </Tabs>
                ) : (
                    <BaseControl
                        label={ __( 'HTML' ) }
                    >
                        { this.getEditor( 'frontend' ) }
                    </BaseControl>
                ) }

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
                                { __( 'You can use PHP to output block' ) } <a href="https://lazyblocks.com/documentation/blocks-code/php/" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-code/php/</a>
                            </p>
                            <hr />
                            <p className="description">
                                { __( 'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.' ) }
                            </p>
                            <p className="description">
                                { __( 'Note 2: supported Handlebars syntax with your controls available by name. For example, if you have control with name' ) } <strong>my_control</strong> { __( ', you can print it' ) } <strong>{ '{{my_control}}' }</strong>.
                            </p>
                        </Popover>
                    ) : '' }
                </Button>

                <p />

                <div className="lzb-constructor-grid">
                    <div>
                        <BaseControl
                            label={ __( 'Single output code for Editor and Frontend' ) }
                        >
                            <CheckboxControl
                                label={ __( 'Yes' ) }
                                checked={ data.code_single_output }
                                onChange={ value => updateData( { code_single_output: value } ) }
                            />
                        </BaseControl>
                    </div>
                    <div>
                        <SelectControl
                            label={ __( 'Show block preview in editor' ) }
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
                    </div>
                </div>
            </div>
        );
    }
}
