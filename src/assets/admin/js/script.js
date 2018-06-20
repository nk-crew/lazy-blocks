import slugify from 'slugify';

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
                        <label for="${ controlNameTemplate }[label]">Label</label>
                        <div class="lzb-metabox-control-expanded">
                            <small>This is the name which will appear on the block edit control</small>
                        </div>
                        <div class="lzb-metabox-control-collapsed">
                            <small data-contain-val="[id='${ controlNameTemplate }[type]']"></small>
                        </div>
                    </div>
                    <div>
                        <input class="lzb-input" id="${ controlNameTemplate }[label]" name="${ controlNameTemplate }[label]" type="text" value="#{label}">
                        <div class="lzb-metabox-control-actions">
                            <a href="#" class="lzb-metabox-control-action-expand">Expand</a>
                            <a href="#" class="lzb-metabox-control-action-remove">Delete</a>
                        </div>
                    </div>
                </div>

                <div class="lzb-metabox-control-expanded">
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
            newControl = newControl.replace( new RegExp( '#{(.+?)}', 'g' ), (match, contents) => {
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
            } );

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

            const $this = $(this);
            const expanded = $this.data('expanded');

            if ( expanded ) {
                $this.closest('[data-control-id]').find('.lzb-metabox-control-expanded').hide();
                $this.closest('[data-control-id]').find('.lzb-metabox-control-collapsed').show();
                $this.text('Expand');
            } else {
                $this.closest('[data-control-id]').find('.lzb-metabox-control-expanded').show();
                $this.closest('[data-control-id]').find('.lzb-metabox-control-collapsed').hide();
                $this.text('Collapse');
            }

            $this.data('expanded', !expanded);
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
});
