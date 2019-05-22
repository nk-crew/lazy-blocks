import CodeEditor from '../../components/code-editor';
import Tabs from '../../components/tabs';

import './editor.scss';

const { __ } = wp.i18n;
const { Component } = wp.element;

export default class CustomCodeSettings extends Component {
    render() {
        const {
            data,
            updateData,
        } = this.props;

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

        return (
            <div className="lzb-constructor-custom-code-settings">
                <Tabs
                    tabs={ [
                        {
                            name: 'frontend',
                            title: __( 'Frontend HTML' ),
                        },
                        {
                            name: 'editor',
                            title: __( 'Editor HTML' ),
                        },
                    ] }
                >
                    { ( tabData ) => {
                        const metaName = `code_${ tabData.name }_html`;

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
                    } }
                </Tabs>
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
            </div>
        );
    }
}
