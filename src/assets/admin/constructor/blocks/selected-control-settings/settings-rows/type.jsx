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
    controls_categories: allCategories,
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
        const availableCategories = {};

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

            availableCategories[ controls[ k ].category ] = 1;

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
                    label={ __( 'Type', '@@text_domain' ) }
                >
                    <Dropdown
                        className="lzb-constructor-type-toggle-dropdown"
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
                                    <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="css-6q0nyr-Svg"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>
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
                                { Object.keys( availableCategories ).map( ( cat ) => {
                                    return (
                                        <PanelBody
                                            key={ cat }
                                            title={ allCategories[ cat ] || cat }
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
