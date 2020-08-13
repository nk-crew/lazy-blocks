import shorthash from 'shorthash';

const {
    addFilter,
} = wp.hooks;

const {
    Component,
} = wp.element;

const {
    getBlockType,
} = wp.blocks;

const {
    createHigherOrderComponent,
} = wp.compose;

const {
    withSelect,
} = wp.data;

/**
 * List of used IDs to prevent duplicates.
 *
 * @type {Object}
 */
const usedIds = {};

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom styles if needed.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withUniqueBlockId = createHigherOrderComponent( ( BlockEdit ) => {
    class newEdit extends Component {
        constructor( ...args ) {
            super( ...args );

            const {
                attributes,
                clientId,
            } = this.props;

            // fix duplicated classes after block clone.
            if ( clientId && attributes.blockId && 'undefined' === typeof usedIds[ attributes.blockId ] ) {
                usedIds[ attributes.blockId ] = clientId;
            }

            this.maybeCreateBlockId = this.maybeCreateBlockId.bind( this );
        }

        componentDidMount() {
            this.maybeCreateBlockId();
        }

        componentDidUpdate() {
            this.maybeCreateBlockId();
        }

        maybeCreateBlockId() {
            if ( ! this.props.blockSettings.lazyblock ) {
                return;
            }

            const {
                setAttributes,
                attributes,
                clientId,
            } = this.props;

            const {
                blockId,
            } = attributes;

            if ( ! blockId || usedIds[ blockId ] !== clientId ) {
                let newBlockId = '';

                // check if ID already exist.
                let tryCount = 10;
                while ( ! newBlockId || ( 'undefined' !== typeof usedIds[ newBlockId ] && usedIds[ newBlockId ] !== clientId && 0 < tryCount ) ) {
                    newBlockId = shorthash.unique( clientId );
                    tryCount -= 1;
                }

                if ( newBlockId && 'undefined' === typeof usedIds[ newBlockId ] ) {
                    usedIds[ newBlockId ] = clientId;
                }

                if ( newBlockId !== blockId ) {
                    const newClass = `${ this.props.name.replace( '/', '-' ) }-${ newBlockId }`;

                    setAttributes( {
                        blockId: newBlockId,
                        blockUniqueClass: newClass,
                    } );
                }
            }
        }

        render() {
            return <BlockEdit { ...this.props } />;
        }
    }

    return withSelect( ( select, ownProps ) => ( {
        blockSettings: getBlockType( ownProps.name ),
    } ) )( newEdit );
}, 'withUniqueBlockId' );

addFilter( 'editor.BlockEdit', 'lazyblocks/uniqueBlockId', withUniqueBlockId );
