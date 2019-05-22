// TODO: remove that shitty code and use React!

const $ = window.jQuery;

// add event to the .val() function.
const originalVal = $.fn.val;
$.fn.val = function() {
    const result = originalVal.apply( this, arguments );
    if ( arguments.length > 0 ) {
        $( this ).trigger( 'lazyblocks-change' );
    }
    return result;
};

function stringTemplate( string, templates ) {
    return string.replace( new RegExp( '#{(.+?)}', 'g' ), ( match, contents ) => {
        if ( templates[ contents ] ) {
            return templates[ contents ];

        // find selected function.
        // #{type:selected?textarea}
        } else if ( new RegExp( '(.+?):selected\?(.+?)', 'g' ).test( contents ) ) {
            if ( templates[ contents.split( ':' )[ 0 ] ] === contents.split( '?' ).pop() ) {
                return ' selected="selected"';
            }
            return '';

        // find checked function.
        // #{type:checked?true}
        } else if ( new RegExp( '(.+?):checked\?(.+?)', 'g' ).test( contents ) ) {
            if ( templates[ contents.split( ':' )[ 0 ] ] === contents.split( '?' ).pop() ) {
                return ' checked="checked"';
            }
            return '';
        }
        return '';
    } );
}

/**
 * Templates
 */
function workWithTemplates() {
    if ( ! wp.api || ! wp.blocks || ! $( 'body.post-type-lazyblocks_templates' ).length ) {
        return;
    }

    // register core Gutenberg blocks.
    if ( wp.blockLibrary && wp.blockLibrary.registerCoreBlocks ) {
        wp.blockLibrary.registerCoreBlocks();
    }

    const $buttons = $( '.lzb-templates-buttons' );
    const $list = $( '.lzb-templates-list' );
    const availableBlocks = wp.blocks.getBlockTypes();
    const availableCategories = wp.blocks.getCategories();
    const blocksList = {};
    const blocksListCategorized = {};
    const categoriesList = {};
    let blocksSelectOptions = '';

    // prepare lazyblocks category to appear in the start of the list.
    blocksListCategorized.lazyblocks = [];

    // prepare categories list.
    availableCategories.forEach( ( cat ) => {
        categoriesList[ cat.slug ] = cat.title;
        blocksListCategorized[ cat.slug ] = [];
    } );

    // prepare blocks list.
    availableBlocks.forEach( ( block ) => {
        if (
            // prevent adding blocks with parent option (fe Grid Column).
            ! ( block.parent && block.parent.length ) &&

            // prevent showing blocks with disabled inserter.
            // allow only lazyblocks free block.
            ! (
                block.name !== 'lazyblock-core/free' &&
                ( block.supports && typeof block.supports.inserter !== 'undefined' && ! block.supports.inserter )
            )
        ) {
            if ( ! blocksListCategorized[ block.category ] ) {
                blocksListCategorized[ block.category ] = [];
            }

            let icon = block.icon.src ? block.icon.src : block.icon;

            // Prepare icon.
            if ( typeof icon === 'function' ) {
                icon = wp.element.renderToString( icon() );
            } else if ( typeof icon === 'object' ) {
                icon = wp.element.renderToString( icon );
            } else if ( typeof icon === 'string' ) {
                icon = wp.element.createElement( wp.components.Dashicon, { icon: icon } );
                icon = wp.element.renderToString( icon );
            }

            blocksList[ block.name ] = {
                name: block.name,
                title: block.title,
                icon: icon,
                useOnce: block.supports && typeof block.supports.multiple !== 'undefined' ? block.supports.multiple : true,
            };

            blocksListCategorized[ block.category ][ block.name ] = blocksList[ block.name ];
        }
    } );

    // prepare blocks list for Select.
    Object.keys( blocksListCategorized ).forEach( ( cat ) => {
        blocksSelectOptions += `<optgroup label="${ categoriesList[ cat ] || cat }">`;
        Object.keys( blocksListCategorized[ cat ] ).forEach( ( k ) => {
            const block = blocksListCategorized[ cat ][ k ];

            blocksSelectOptions += `<option value="${ block.name }">${ block.title }</option>`;
        } );
        blocksSelectOptions += '</optgroup>';
    } );

    const singleTemplate = `
        <div class="lzb-templates-single" data-template-id="#{ID}" data-template-post-type="#{post_type}" data-template-post-label="#{post_label}">
            <div class="lzb-metabox">
                <div class="lzb-metabox-label">
                    <label>#{post_label}</label>
                </div>
            </div>
            <div class="lzb-metabox">
                <div class="lzb-metabox-label">
                    <label>Template Lock</label>
                </div>
                <div>
                    <select class="lzb-select" name="template_lock">
                        <option value="">None</option>
                        <option value="all" #{template_lock:selected?all}>Prevent all operations</option>
                        <option value="insert" #{template_lock:selected?insert}>Prevent inserting new blocks, but allows moving existing ones</option>
                    </select>
                </div>
            </div>
            <div class="lzb-metabox">
                <div class="lzb-metabox-label">
                    <label>Blocks</label>
                </div>
                <div>
                    <ul class="lzb-templates-single-blocks">#{blocks}</ul>
                    <select class="lzb-select lzb-templates-single-add-blocks" placeholder="+ Add block">
                        #{blocks_list}
                    </select>
                </div>
            </div>
            <ul class="lzb-templates-single-actions">
                <a href="#" class="lzb-templates-single-actions-remove">Remove</a>
                <button class="button button-primary lzb-templates-single-actions-save">Save Template</button>
            </ul>
        </div>
    `;

    const blockTemplate = `
        <div class="lzb-templates-single-blocks-block #{class}" data-block-name="#{name}">
            <span class="lzb-templates-single-blocks-block-icon">#{icon}</span>
            <span>#{title} <small>[#{name}]</small></span>
            <button class="lzb-templates-single-blocks-block-remove"><span class="dashicons dashicons-no-alt"></span></button>
        </div>
    `;

    // add template to the page.
    function addTemplate( templates, type = 'append' ) {
        $list[ type ]( stringTemplate( singleTemplate, templates ) );
        $buttons.find( '[data-post-type="' + templates[ 'post_type' ] + '"]' ).attr( 'disabled', 'disabled' );
    }

    function initSelectize() {
        if ( typeof $.fn.selectize !== 'undefined' ) {
            $( '.lzb-select:not(.lzb-select-ready)' ).each( function() {
                const $select = $( this ).addClass( 'lzb-select-ready' );
                const placeholder = $select.attr( 'placeholder' );
                const clearOnChange = $select.hasClass( 'lzb-templates-single-add-blocks' );

                $select.selectize( {
                    allowEmptyOption: ! placeholder,
                    placeholder: placeholder,
                    searchField: [ 'text', 'optgroup' ],
                    onChange() {
                        if ( clearOnChange ) {
                            setTimeout( () => {
                                $select[ 0 ].selectize.clear();
                            }, 20 );
                        }
                    },
                    onInitialize() {
                        if ( placeholder ) {
                            $select[ 0 ].selectize.clear();
                        }
                    },
                    render: {
                        option: function( item, escape ) {
                            let icon = '';
                            if ( blocksList[ item.value ] ) {
                                icon = blocksList[ item.value ].icon;
                            }
                            return `<div><span class="selectize-svg-icon">${ icon }</span>${ escape( item.text ) }</div>`;
                        },
                    },
                } );
            } );
        }
    }

    // fetch all templates.
    const templates = new wp.api.collections.Lazyblocks_templates( { data: { per_page: 999 } } );
    templates.fetch().done( function( templatesData ) {
        $list.html( '' );

        templatesData.forEach( ( item ) => {
            let meta;
            try {
                meta = JSON.parse( decodeURI( item.meta.lzb_template_data ) );
            } catch ( e ) {
                meta = {};
            }
            let blocksString = '';

            meta.blocks.forEach( ( val ) => {
                let blockData = val;
                blockData.title = 'Undefined Block';
                if ( blocksList[ val.name ] ) {
                    blockData = blocksList[ val.name ];
                } else {
                    blockData.icon = '<svg aria-hidden="true" role="img" focusable="false" class="dashicon dashicons-warning" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8zm1.13 9.38l.35-6.46H8.52l.35 6.46h2.26zm-.09 3.36c.24-.23.37-.55.37-.96 0-.42-.12-.74-.36-.97s-.59-.35-1.06-.35-.82.12-1.07.35-.37.55-.37.97c0 .41.13.73.38.96.26.23.61.34 1.06.34s.8-.11 1.05-.34z"></path></svg>';
                    blockData.class = 'lzb-templates-single-blocks-undefined';
                }
                blocksString += stringTemplate( blockTemplate, blockData );
            } );

            addTemplate( {
                ID: item.id,
                post_type: meta.post_type || 'post',
                post_label: meta.post_label || meta.post_type || 'post',
                blocks: blocksString,
                template_lock: meta.template_lock || '',
                blocks_list: blocksSelectOptions,
            } );
            initSelectize();
        } );
    } );

    // add new template.
    $buttons.on( 'click', 'button', function( e ) {
        e.preventDefault();

        const $this = $( this );

        $this.attr( 'disabled', 'disabled' );

        const post = new wp.api.models.Lazyblocks_templates( {
            title: $( this ).attr( 'data-post-label' ),
            status: 'publish',
            meta: {
                lzb_template_data: encodeURI( JSON.stringify( {
                    post_type: $this.attr( 'data-post-type' ),
                    post_label: $this.attr( 'data-post-label' ),
                    template_lock: '',
                    blocks: [],
                } ) ),
            },
        } );
        post.save().done( function( postData ) {
            if ( postData && postData.id ) {
                addTemplate( {
                    ID: postData.id,
                    post_type: $this.attr( 'data-post-type' ),
                    post_label: $this.attr( 'data-post-label' ),
                    blocks: '',
                    template_lock: '',
                    blocks_list: blocksSelectOptions,
                }, 'prepend' );
                initSelectize();
            } else {
                $this.removeAttr( 'disabled' );
            }
        } );
    } );

    // update template.
    $list.on( 'click', '.lzb-templates-single-actions-save', function( e ) {
        e.preventDefault();
        const $this = $( this );
        const $template = $( this ).closest( '[data-template-id]' );
        const blocks = [];

        $template.find( '.lzb-templates-single-blocks .lzb-templates-single-blocks-block' ).each( function() {
            blocks.push( {
                name: $( this ).attr( 'data-block-name' ),
            } );
        } );

        const post = new wp.api.models.Lazyblocks_templates( {
            id: $template.attr( 'data-template-id' ),
            meta: {
                lzb_template_data: encodeURI( JSON.stringify( {
                    post_type: $template.attr( 'data-template-post-type' ),
                    post_label: $template.attr( 'data-template-post-label' ),
                    template_lock: $template.find( '[name="template_lock"]' ).val() || '',
                    blocks: blocks,
                } ) ),
            },
        } );

        $this.attr( 'disabled', 'disabled' );
        post.save().done( function() {
            setTimeout( () => {
                $this.removeAttr( 'disabled' );
            }, 500 );
        } );
    } );

    // remove template.
    $list.on( 'click', '.lzb-templates-single-actions-remove', function( e ) {
        e.preventDefault();
        const $template = $( this ).closest( '[data-template-id]' );
        const post = new wp.api.models.Lazyblocks_templates( {
            id: $template.attr( 'data-template-id' ),
        } );

        $template.hide();
        post.destroy( { force: true } ).done( function( postData ) {
            if ( postData && postData.deleted ) {
                $buttons.find( '[data-post-type="' + $template.attr( 'data-template-post-type' ) + '"]' ).removeAttr( 'disabled' );
                $template.remove();
            } else {
                // eslint-disable-next-line no-console
                console.log( postData );
                $template.show();
            }
        } );
    } );

    // add blocks to template.
    // TODO: prevent to add it twice if the block has disabled 'multiple' support
    $list.on( 'change', '.lzb-templates-single-add-blocks', function( e ) {
        e.preventDefault();

        const $this = $( this );
        const blockSlug = $this.val();
        const $template = $this.closest( '[data-template-id]' );

        if ( blocksList[ blockSlug ] ) {
            $template.find( '.lzb-templates-single-blocks' ).append( stringTemplate( blockTemplate, blocksList[ blockSlug ] ) );
        }

        $this.val( '' );
    } );

    // remove blocks from template.
    $list.on( 'click', '.lzb-templates-single-blocks-block-remove', function( e ) {
        e.preventDefault();

        $( this ).closest( '.lzb-templates-single-blocks-block' ).remove();
    } );
}

jQuery( () => {
    wp.api.loadPromise.done( function() {
        if ( ! wp.api.models.Lazyblocks_templates ) {
            return;
        }

        workWithTemplates();
    } );
} );
