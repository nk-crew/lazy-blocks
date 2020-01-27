import getControlTypeData from '../../../../utils/get-control-type-data';

const { __ } = wp.i18n;

const {
    Component,
} = wp.element;

const {
    PanelBody,
    BaseControl,
    Dropdown,
    TextControl,
} = wp.components;

const {
    withSelect,
} = wp.data;

const {
    controls,
} = window.lazyblocksConstructorData;

const hiddenIconCategories = {};

class TypeRow extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            search: '',
        };
    }

    render() {
        const {
            updateData,
            blockData,
            data,
        } = this.props;

        const {
            type = '',
        } = data;

        const searchString = this.state.search.toLowerCase();
        const allCategories = {};

        const types = Object.keys( controls ).filter( ( k ) => {
            const iconName = controls[ k ].name;

            if (
                ! searchString ||
                ( searchString && iconName.indexOf( searchString.toLowerCase() ) > -1 )
            ) {
                return true;
            }

            return false;
        } ).map( ( k ) => {
            const controlTypeData = getControlTypeData( controls[ k ].name );
            let isDisabled = false;

            // restrictions.
            if ( ! isDisabled && controlTypeData ) {
                // restrict as child.
                if ( ! controlTypeData.restrictions.as_child ) {
                    isDisabled = data.child_of;
                }

                // restrict once per block.
                if ( ! isDisabled && controlTypeData.restrictions.once && blockData && blockData.controls ) {
                    Object.keys( blockData.controls ).forEach( ( i ) => {
                        if ( controlTypeData.name === blockData.controls[ i ].type ) {
                            isDisabled = true;
                        }
                    } );
                }
            }

            allCategories[ controls[ k ].category ] = 1;

            return {
                name: controls[ k ].name,
                label: controls[ k ].label,
                category: controls[ k ].category,
                icon: controlTypeData.icon,
                isDisabled,
            };
        } );

        return (
            <PanelBody>
                <BaseControl
                    label={ __( 'Type' ) }
                >
                    <Dropdown
                        renderToggle={ ( { isOpen, onToggle } ) => {
                            const controlTypeData = getControlTypeData( type );
                            return (
                                <button
                                    aria-expanded={ isOpen }
                                    onClick={ onToggle }
                                    className="lzb-constructor-type-toggle"
                                >
                                    <span dangerouslySetInnerHTML={ { __html: controlTypeData.icon } } />
                                    { controlTypeData.label }
                                </button>
                            );
                        } }
                        renderContent={ () => (
                            <div className="lzb-constructor-type-dropdown">
                                <TextControl
                                    value={ this.state.search }
                                    onChange={ ( searchVal ) => (
                                        this.setState( { search: searchVal } )
                                    ) }
                                    placeholder={ __( 'Type to Search...', '@@text_domain' ) }
                                    autoComplete="off"
                                />
                                { Object.keys( allCategories ).map( ( cat ) => {
                                    return (
                                        <PanelBody
                                            key={ cat }
                                            title={ cat }
                                            initialOpen={ ! hiddenIconCategories[ cat ] }
                                            onToggle={ () => {
                                                hiddenIconCategories[ cat ] = typeof hiddenIconCategories[ cat ] === 'undefined' ? true : ! hiddenIconCategories[ cat ];
                                            } }
                                        >
                                            { types.map( ( thisType ) => {
                                                if ( thisType.category !== cat ) {
                                                    return '';
                                                }

                                                return (
                                                    <button
                                                        key={ cat + thisType.name }
                                                        onClick={ () => updateData( { type: thisType.name } ) }
                                                        disabled={ thisType.isDisabled }
                                                        className={ type === thisType.name ? 'is-active' : '' }
                                                    >
                                                        <span dangerouslySetInnerHTML={ { __html: thisType.icon } } />
                                                        { thisType.label }
                                                    </button>
                                                );
                                            } ) }
                                        </PanelBody>
                                    );
                                } ) }
                            </div>
                        ) }
                    />
                </BaseControl>
            </PanelBody>
        );
    }
}

export default withSelect( ( select ) => {
    const {
        getBlockData,
    } = select( 'lazy-blocks/block-data' );

    return {
        blockData: getBlockData(),
    };
} )( TypeRow );
