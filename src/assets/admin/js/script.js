import slugify from 'slugify';

// TODO: remove that shitty code and use React!

jQuery(function ($) {
    const data = window.lazyblocksData;

    // generate unique id.
    // thanks to https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function getUID() {
        return 'xxxyxx4xxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // add event to the .val() function.
    const originalVal = $.fn.val;
    $.fn.val = function(){
        const result = originalVal.apply(this,arguments);
        if(arguments.length > 0) {
            $(this).trigger('lazyblocks-change');
        }
        return result;
    };

    function stringTemplate( string, data ) {
        return string.replace( new RegExp( '#{(.+?)}', 'g' ), (match, contents) => {
            if ( data[contents] ) {
                return data[contents];

                // find selected function.
                // #{type:selected?textarea}
            } else if ( new RegExp( '(.+?):selected\?(.+?)', 'g' ).test( contents ) ) {
                if ( data[contents.split(':')[0]] === contents.split('?').pop() ) {
                    return ' selected="selected"';
                } else {
                    return '';
                }

                // find checked function.
                // #{type:checked?true}
            } else if ( new RegExp( '(.+?):checked\?(.+?)', 'g' ).test( contents ) ) {
                if ( data[contents.split(':')[0]] === contents.split('?').pop() ) {
                    return ' checked="checked"';
                } else {
                    return '';
                }
            }
            return '';
        } )
    }


    /**
     * Blocks.
     */

    // preview for block icon option.
    $('.lzb-dashicons-picker > input').on('input lazyblocks-change', function () {
        let className = $(this).val();
        const $iconPreview = $(this).parent().find('.lzb-dashicons-picker-preview');

        if ( className && $iconPreview.length ) {
            if ( className.indexOf('dashicons') !== -1 ) {
                className = 'dashicons ' + className;
            }
            $iconPreview.attr('class', 'lzb-dashicons-picker-preview ' + className);
        }
    }).trigger('lazyblocks-change');

    // fix for dashicons picker position.
    $(document).on( 'click', '.lzb-dashicons-picker .dashicons-picker', function ( e ) {
        const $iconContainer = $('.dashicon-picker-container');
        const $iconPicker = $(e.target).closest('.lzb-dashicons-picker');

        $iconContainer.css({
            top: $iconPicker.offset().top + $iconPicker.outerHeight(),
            left: $iconPicker.offset().left + $iconPicker.outerWidth() - $iconContainer.outerWidth(),
        });
    } );

    // prevent form submit.
    $('button.dashicons-picker').on('click', function (e) {
        e.preventDefault();
    });

    // add selectize tags.
    if ( typeof $.fn.selectize !== 'undefined' ) {
        $('#lazyblocks_keywords').selectize({
            plugins: ['drag_drop', 'remove_button'],
            delimiter: ',',
            maxItems: 3,
            selectOnTab: true,
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            }
        });
        $('#lazyblocks_condition_post_types').selectize({
            plugins: ['drag_drop', 'remove_button'],
            delimiter: ',',
            selectOnTab: true,
            create: function(input) {
                return {
                    value: input,
                    text: input
                }
            }
        });
        $('#lazyblocks_keywords-selectized').on('keypress', function(e) {
            if ( event.keyCode === 13 ) {
                e.preventDefault();
            }
        });
    }


    /**
     * Controls
     */
    const $controls = $('#lazyblocks_controls .lzb-metabox');

    // new control template.
    const controlNameTemplate = 'lazyblocks_controls[#{ID}]';
    const controlTemplate = `
            <div class="lzb-metabox-control" data-control-id="control_#{ID}">
                <div class="lzb-metabox">
                    <div class="lzb-metabox-label">
                        <label data-contain-val="[id='${ controlNameTemplate }[label]']"></label>
                        <small data-contain-val="[id='${ controlNameTemplate }[name]']"></small>
                    </div>
                    <div>
                        <div class="lzb-metabox-control-info">
                            <div>
                                <small data-contain-val="[id='${ controlNameTemplate }[type]']"></small>
                            </div>
                            <div>
                                <small data-contain-val="[id='${ controlNameTemplate }[placement]']"></small>
                            </div>
                            <div>
                                <small data-cond="[id='${ controlNameTemplate }[save_in_meta]" data-contain-val="[id='${ controlNameTemplate }[save_in_meta_name]']"></small>
                                <small data-cond="[id='${ controlNameTemplate }[save_in_meta] != 1">-</small>
                            </div>
                        </div>
                        <div class="lzb-metabox-control-actions">
                            <a href="#" class="lzb-metabox-control-action-expand">Expand</a>
                            <a href="#" class="lzb-metabox-control-action-remove">Delete</a>
                        </div>
                    </div>
                </div>

                <div class="lzb-metabox-control-expanded">
                    <div class="lzb-metabox">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[label]">Label</label>
                            <small>This is the name which will appear on the block edit control</small>
                        </div>
                        <div>
                            <input class="lzb-input" id="${ controlNameTemplate }[label]" name="${ controlNameTemplate }[label]" type="text" value="#{label}">
                        </div>
                    </div>
                    <div class="lzb-metabox">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[name]">Name</label>
                            <small>Unique control name, no spaces. Underscores and dashes allowed</small>
                        </div>
                        <div>
                            <input class="lzb-input" id="${ controlNameTemplate }[name]" name="${ controlNameTemplate }[name]" type="text" value="#{name}">
                        </div>
                    </div>
                    <div class="lzb-metabox">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[type]">Type</label>
                        </div>
                        <div>
                            <select class="lzb-select" name="${ controlNameTemplate }[type]" id="${ controlNameTemplate }[type]">
                                <optgroup label="Basic">
                                    <option value="text" #{type:selected?text}>Text</option>
                                    <option value="textarea" #{type:selected?textarea}>Text Area</option>
                                    <option value="number" #{type:selected?number}>Number</option>
                                    <option value="url" #{type:selected?url}>URL</option>
                                    <option value="email" #{type:selected?email}>Email</option>
                                    <option value="password" #{type:selected?password}>Password</option>
                                </optgroup>
                                <optgroup label="Content">
                                    <option value="image" #{type:selected?image}>Image</option>
                                    <option value="gallery" #{type:selected?gallery}>Gallery</option>
                                    <option value="code_editor" #{type:selected?code_editor}>Code Editor</option>
                                </optgroup>
                                <optgroup label="Choice">
                                    <option value="select" #{type:selected?select}>Select</option>
                                    <option value="checkbox" #{type:selected?checkbox}>Checkbox</option>
                                    <option value="toggle" #{type:selected?toggle}>Toggle</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == select">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[default]">Choices</label>
                            <small>Enter each choice on a new line.</small>
                            <small>For more control, you may specify both a value and label like this:</small>
                            <small>value : Label</small>
                        </div>
                        <div>
                            <textarea class="lzb-textarea" id="${ controlNameTemplate }[choices]" name="${ controlNameTemplate }[choices]" rows="6">#{choices}</textarea>
                        </div>
                    </div>
                    <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] != image && [id='${ controlNameTemplate }[type]'] != gallery && [id='${ controlNameTemplate }[type]'] != code_editor && [id='${ controlNameTemplate }[type]'] != checkbox && [id='${ controlNameTemplate }[type]'] != toggle">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[default]">Default value</label>
                            <small>Appears when inserting a new block</small>
                        </div>
                        <div>
                            <input class="lzb-input" id="${ controlNameTemplate }[default]" name="${ controlNameTemplate }[default]" type="text" value="#{default}">
                        </div>
                    </div>
                    <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == checkbox || [id='${ controlNameTemplate }[type]'] == toggle">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[default]">Checked</label>
                        </div>
                        <div>
                            <label>
                                <input type="hidden" name="${ controlNameTemplate }[checked]" id="${ controlNameTemplate }[checked]_hidden" value="false">
                                <input class="lzb-input" type="checkbox" name="${ controlNameTemplate }[checked]" id="${ controlNameTemplate }[checked]" value="true" #{checked:checked?true}>
                                Yes
                            </label>
                        </div>
                    </div>
                    <div class="lzb-metabox">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[placement]">Placement</label>
                        </div>
                        <div>
                            <select class="lzb-select" name="${ controlNameTemplate }[placement]" id="${ controlNameTemplate }[placement]">
                                <option value="inspector" #{placement:selected?inspector}>Inspector</option>
                                <option value="content" #{placement:selected?content}>Content</option>
                                <option value="both" #{placement:selected?both}>Both</option>
                                <option value="nowhere" #{placement:selected?nowhere}>Nowhere</option>
                            </select>
                        </div>
                    </div>
                    <div class="lzb-metabox">
                        <div class="lzb-metabox-label">
                            <label for="${ controlNameTemplate }[save_in_meta]">Save in Meta</label>
                        </div>
                        <div>
                            <label>
                                <input type="hidden" name="${ controlNameTemplate }[save_in_meta]" id="${ controlNameTemplate }[save_in_meta]_hidden" value="false">
                                <input class="lzb-input" type="checkbox" name="${ controlNameTemplate }[save_in_meta]" id="${ controlNameTemplate }[save_in_meta]" value="true" #{save_in_meta:checked?true}>
                                Yes
                            </label>
                            <div data-cond="[id='${ controlNameTemplate }[save_in_meta]']">
                                <br />
                                <input class="lzb-input" id="${ controlNameTemplate }[save_in_meta_name]" name="${ controlNameTemplate }[save_in_meta_name]" type="text" value="#{save_in_meta_name}" placeholder="Unique metabox name">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // add control.
    function addControl( data ) {
        if ( data.ID && data.ID === 'uniq' ) {
            let ID = getUID();
            while ( $(`[data-control-id="control_${ ID }"]`).length ) {
                ID = getUID();
            }
            data.ID = `control_${ ID }`;
        }
        if ( data.ID ) {
            let newControl = controlTemplate;

            // add template values.
            newControl = stringTemplate( newControl, data );

            $controls.find('.lzb-metabox-controls').append( newControl );

            // expand.
            $controls.find(`[data-control-id="control_${ data.ID }"] .lzb-metabox-control-action-expand`).click();

            // conditionize init.
            $controls.find(`[data-control-id="control_${ data.ID }"]`).find('input, select, textarea').change();
        }
    }

    // remove control.
    function removeControl( ID ) {
        $controls.find(`[data-control-id="${ ID }"]`).remove();
    }

    // condition.
    function updateConditionalFields() {
        $controls.find('[data-cond]').hide().each(function() {
            const $this = $(this);
            const $listenTo = $($this.attr('data-cond'));
            let result;

            if ($listenTo.is('[type="radio"], [type="checkbox"]')) {
                result = $listenTo.is(':checked');
            } else if ($listenTo.is('textarea, select, input')) {
                result = $listenTo.val();
            }

            if ( result ) {
                $this.show();
            } else {
                $this.hide();
            }
        });
    }

    // contain values
    function updateContainValues() {
        $controls.find('[data-contain-val]').each(function() {
            const $this = $(this);
            const $listenTo = $($this.attr('data-contain-val'));
            let result;

            if ($listenTo.is('[type="radio"], [type="checkbox"]')) {
                result = $listenTo.is(':checked') ? 'true' : 'false' ;
            } else if ($listenTo.is('textarea, select, input')) {
                result = $listenTo.val();
            }

            $this.html(result);
        });
    }

    if ( $controls.length ) {
        // enable conditionize
        if ( $.fn.conditionize ) {
            $controls.conditionize();
        }

        // first page load template
        const startingTemplate = `
            <div class="lzb-metabox-controls"></div>
            <div class="lzb-metabox-add-control">
                <button class="button button-primary button-large">+ Add Control</button>
            </div>
        `;
        $controls.html(startingTemplate);

        // add existing controls.
        Object.keys(data.controls).map((key) => {
            addControl( Object.assign( { ID: key }, data.controls[ key ] ) );
        });

        // events.

        // conditions and contain values
        // updateConditionalFields();
        updateContainValues();
        $controls.on('change', 'input, select, textarea', function () {
            // updateConditionalFields();
            updateContainValues();
        });

        // add control.
        $controls.on('click', '.lzb-metabox-add-control button', function (e) {
            e.preventDefault();

            addControl({
                ID: 'uniq',
            });
        });

        // remove control
        $controls.on('click', '.lzb-metabox-control-action-remove', function (e) {
            e.preventDefault();

            removeControl($(this).closest('[data-control-id]').attr('data-control-id'));
        });

        // expand collapsed options.
        $controls.on('click', '.lzb-metabox-control-action-expand', function (e) {
            e.preventDefault();

            const $control = $(this).closest('[data-control-id]');
            const expanded = $control.data('expanded');

            if ( expanded ) {
                $control.find('.lzb-metabox-control-expanded').stop().slideUp();
                $control.find('.lzb-metabox-control-collapsed').stop().slideDown();
                $control.find('.lzb-metabox-control-action-expand').text('Expand');
            } else {
                $control.find('.lzb-metabox-control-expanded').stop().slideDown();
                $control.find('.lzb-metabox-control-collapsed').stop().slideUp();
                $control.find('.lzb-metabox-control-action-expand').text('Collapse');
            }

            $control.data('expanded', !expanded);
        });

        // slugify
        $controls.on('blur', '.lzb-metabox input', function (e) {
            e.preventDefault();
            const $this = $(this);
            const name = $this.attr('name');
            let $nameInput = false;

            // add slug if don't exists.
            if ( /\[label]$/.test(name) ) {
                $nameInput = $(`[name="${ name.replace( /\[label]$/, '[name]' ) }"]`);

                if ( $nameInput.val() ) {
                    $nameInput = false;
                } else {
                    $nameInput.val( $this.val() );
                }
            }

            // slugify name control after user changed it.
            if ( /\[name]$/.test(name) ) {
                $nameInput = $this;
            }

            if ( $nameInput && $nameInput.length ) {
                $nameInput.val( slugify( $nameInput.val(), {
                    replacement: '_',
                    lower: true
                } ) );
            }
        });
    }


    /**
     * Templates
     */
    if ( ! wp.api ) {
        return;
    }

    wp.api.loadPromise.done( function() {
        if ( ! wp.api.models.Lazyblocks_templates ) {
            return;
        }

        const $buttons = $('.lzb-templates-buttons');
        const $list = $('.lzb-templates-list');
        const $availableBlocks = $('.lzb-templates-blocks');
        let blocksList = {};
        let blocksListCategorized = {};
        let blocksSelectOptions = '';

        // prepare blocks list.
        $availableBlocks.children('div').each( function() {
            const $block = $(this);
            const name = $block.attr('data-block-name');
            const cat = name.split('/')[0];

            if ( ! blocksListCategorized[ cat ] ) {
                blocksListCategorized[ cat ] = [];
            }

            blocksList[ name ] = {
                name: name,
                title: $block.attr('data-block-title'),
                icon: $block.attr('data-block-icon'),
                useOnce: $block.attr('data-block-use-once'),
            };
            blocksListCategorized[ cat ][ name ] = blocksList[ name ];
        } );

        // prepare blocks list for Select.
        Object.keys( blocksListCategorized ).forEach( ( cat ) => {
            blocksSelectOptions += `<optgroup label="${ cat }">`;
                Object.keys( blocksListCategorized[cat] ).forEach( ( k ) => {
                    const block = blocksListCategorized[cat][k];

                    blocksSelectOptions += `<option value="${ block.name }">${ block.title }</option>`;
                } );
            blocksSelectOptions += `</optgroup>`;
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
                        <select class="lzb-select lzb-templates-single-add-blocks">
                            <option value="" selected="selected" disabled="disabled">+ Add block</option>
                            #{blocks_list}
                        </select>
                    </div>
                </div>
                <ul class="lzb-templates-single-actions">
                    <a href="#" class="lzb-templates-single-actions-remove">Remove</a>
                    <button class="button button-primary button-small lzb-templates-single-actions-save">Save Template</button>
                </ul>
            </div>
        `;

        const blockTemplate = `
            <div class="lzb-templates-single-blocks-block" data-block-name="#{name}" data-block-title="#{title}" data-block-icon="#{icon}">
                <span class="#{icon}"></span>
                <span>#{title} <small>[#{name}]</small></span>
                <button class="lzb-templates-single-blocks-block-remove"><span class="dashicons dashicons-no-alt"></span></button>
            </div>
        `;

        // add template to the page.
        function addTemplate( data, type = 'append' ) {
            $list[type]( stringTemplate( singleTemplate, data ) );
            $buttons.find('[data-post-type="' + data['post_type'] + '"]').attr('disabled', 'disabled');
        }

        // fetch all templates.
        const templates = new wp.api.collections.Lazyblocks_templates( { data: { per_page: 999 } } );
        templates.fetch().done( function( data ){
            $list.html('');

            data.forEach( ( item ) => {
                let meta;
                try {
                    meta = JSON.parse( decodeURI( item.meta.lzb_template_data ) );
                } catch(e) {
                    meta = {};
                }
                let blocksString = '';

                meta.blocks.forEach( ( val ) => {
                    blocksString += stringTemplate( blockTemplate, val );
                } );

                addTemplate( {
                    ID: item.id,
                    post_type: meta.post_type || 'post',
                    post_label: meta.post_label || meta.post_type || 'post',
                    blocks: blocksString,
                    template_lock: meta.template_lock || '',
                    blocks_list: blocksSelectOptions,
                } );
            } );
        } );

        // add new template.
        $buttons.on('click', 'button', function (e) {
            e.preventDefault();

            const $this = $(this);

            $this.attr('disabled', 'disabled');

            const post = new wp.api.models.Lazyblocks_templates( {
                title: $(this).attr('data-post-label'),
                status: 'publish',
                meta: {
                    lzb_template_data: encodeURI( JSON.stringify( {
                        post_type: $this.attr('data-post-type'),
                        post_label: $this.attr('data-post-label'),
                        template_lock: '',
                        blocks: [],
                    } ) ),
                }
            } );
            post.save().done( function( data ) {
                if ( data && data.id ) {
                    addTemplate( {
                        ID: data.id,
                        post_type: $this.attr('data-post-type'),
                        post_label: $this.attr('data-post-label'),
                        blocks: '',
                        template_lock: '',
                        blocks_list: blocksSelectOptions,
                    }, 'prepend' );
                } else {
                    $this.removeAttr('disabled');
                }
            } );
        });

        // update template.
        $list.on('click', '.lzb-templates-single-actions-save', function (e) {
            e.preventDefault();
            const $this = $(this);
            const $template = $(this).closest('[data-template-id]');
            const blocks = [];

            $template.find('.lzb-templates-single-blocks .lzb-templates-single-blocks-block').each( function() {
                blocks.push({
                    name: $(this).attr('data-block-name'),
                    title: $(this).attr('data-block-title'),
                    icon: $(this).attr('data-block-icon'),
                });
            } );

            const post = new wp.api.models.Lazyblocks_templates( {
                id: $template.attr('data-template-id'),
                meta: {
                    lzb_template_data: encodeURI( JSON.stringify( {
                        post_type: $template.attr('data-template-post-type'),
                        post_label: $template.attr('data-template-post-label'),
                        template_lock: $template.find('[name="template_lock"]').val() || '',
                        blocks: blocks,
                    } ) ),
                }
            } );

            $this.attr('disabled', 'disabled');
            post.save().done( function() {
                setTimeout(() => {
                    $this.removeAttr('disabled');
                }, 500);
            } );
        });

        // remove template.
        $list.on('click', '.lzb-templates-single-actions-remove', function (e) {
            e.preventDefault();
            const $template = $(this).closest('[data-template-id]');
            const post = new wp.api.models.Lazyblocks_templates( {
                id: $template.attr('data-template-id')
            } );

            $template.hide();
            post.destroy( { force: true } ).done( function( data ){
                if ( data && data.deleted ) {
                    $buttons.find('[data-post-type="' + $template.attr('data-template-post-type') + '"]').removeAttr('disabled');
                    $template.remove();
                } else {
                    console.log(data);
                    $template.show();
                }
            } );
        });

        // add blocks to template.
        // TODO: prevent to add it twice if the block has disabled 'multiple' support
        $list.on('change', '.lzb-templates-single-add-blocks', function(e) {
            e.preventDefault();

            const $this = $(this);
            const blockSlug = $this.val();
            const $template = $this.closest('[data-template-id]');

            if ( blocksList[blockSlug] ) {
                $template.find('.lzb-templates-single-blocks').append( stringTemplate( blockTemplate, blocksList[blockSlug] ) );
            }

            $this.val('');
        });

        // remove blocks from template.
        $list.on('click', '.lzb-templates-single-blocks-block-remove', function(e) {
            e.preventDefault();

            $(this).closest('.lzb-templates-single-blocks-block').remove();
        });
    });
});
