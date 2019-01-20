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
        constructor() {
            super( ...arguments );

            this.maybeCreateBlockId = this.maybeCreateBlockId.bind( this );
        }

        componentDidMount() {
            if ( ! this.props.blockSettings.lazyblock ) {
                return;
            }
            this.maybeCreateBlockId();
        }

        maybeCreateBlockId() {
            const {
                setAttributes,
                attributes,
                clientId,
            } = this.props;

            const {
                blockId,
            } = attributes;

            if (
                clientId &&
                typeof blockId !== 'undefined' &&
                (
                    ! blockId ||
                    (
                        blockId && typeof usedIds[ blockId ] !== 'undefined'
                    )
                )
            ) {
                let newBlockId = '';

                // check if ID already exist.
                let tryCount = 10;
                while ( ! newBlockId || ( typeof usedIds[ newBlockId ] !== 'undefined' && usedIds[ newBlockId ] !== clientId && tryCount > 0 ) ) {
                    newBlockId = shorthash.unique( clientId );
                    tryCount--;
                }

                if ( newBlockId && typeof usedIds[ newBlockId ] === 'undefined' ) {
                    usedIds[ newBlockId ] = clientId;
                }

                if ( newBlockId !== blockId ) {
                    setAttributes( {
                        blockId: newBlockId,
                    } );
                }
            }
        }

        render() {
            return <BlockEdit { ...this.props } />;
        }
    }

    return withSelect( ( select, ownProps ) => {
        return {
            blockSettings: getBlockType( ownProps.name ),
        };
    } )( newEdit );
}, 'withUniqueBlockId' );

addFilter( 'editor.BlockEdit', 'lazyblocks/uniqueBlockId', withUniqueBlockId );
