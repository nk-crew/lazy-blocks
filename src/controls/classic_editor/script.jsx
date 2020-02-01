import TMCE from './tmce';

const {
    addFilter,
} = wp.hooks;

const {
    BaseControl,
} = wp.components;

/**
 * Control render in editor.
 */
addFilter( 'lzb.editor.control.classic_editor.render', 'lzb.editor', ( render, props ) => {
    return (
        <BaseControl
            key={ props.data.name }
            label={ props.data.label }
            help={ props.data.help }
            className="lzb-gutenberg-classic-editor"
        >
            <TMCE
                content={ props.getValue() }
                onChange={ ( val ) => {
                    props.onChange( val );
                } }
                editorId={ props.uniqueId }
            />
        </BaseControl>
    );
} );
