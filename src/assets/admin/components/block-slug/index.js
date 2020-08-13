// Import CSS
import './editor.scss';

const { Component } = wp.element;
const {
    BaseControl,
    TextControl,
} = wp.components;

export default class BlockSlug extends Component {
    render() {
        return (
            <BaseControl
                label={ this.props.label || '' }
            >
                <div className="lazyblocks-component-block-slug">
                    <div className="lazyblocks-component-block-slug-prefix">lazyblock/</div>
                    <TextControl
                        { ...{
                            ...this.props,
                            ...{ label: '' },
                        } }
                    />
                </div>
            </BaseControl>
        );
    }
}
