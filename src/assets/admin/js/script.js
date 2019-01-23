import slugify from 'slugify';

// TODO: remove that shitty code and use React!

const data = window.lazyblocksData;
const $ = window.jQuery;

// generate unique id.
// thanks to https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function getUID() {
    return 'xxxyxx4xxx'.replace( /[xy]/g, function( c ) {
        // eslint-disable-next-line
        let r = Math.random() * 16 | 0;
        // eslint-disable-next-line
        const v = c === 'x' ? r : ( r & 0x3 | 0x8 );
        return v.toString( 16 );
    } );
}

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
 * Blocks.
 */

// preview for block icon option.
$( '.lzb-dashicons-picker > input' ).on( 'input lazyblocks-change', function() {
    let className = $( this ).val();
    const $iconPreview = $( this ).parent().find( '.lzb-dashicons-picker-preview' );

    if ( className && $iconPreview.length ) {
        if ( className.indexOf( 'dashicons' ) !== -1 ) {
            className = 'dashicons ' + className;
        }
        $iconPreview.attr( 'class', 'lzb-dashicons-picker-preview ' + className );
    }
} ).trigger( 'lazyblocks-change' );

// fix for dashicons picker position.
$( document ).on( 'click', '.lzb-dashicons-picker .dashicons-picker', function( e ) {
    const $iconContainer = $( '.dashicon-picker-container' );
    const $iconPicker = $( e.target ).closest( '.lzb-dashicons-picker' );

    $iconContainer.css( {
        top: $iconPicker.offset().top + $iconPicker.outerHeight(),
        left: $iconPicker.offset().left + $iconPicker.outerWidth() - $iconContainer.outerWidth(),
    } );
} );

// prevent form submit.
$( 'button.dashicons-picker' ).on( 'click', function( e ) {
    e.preventDefault();
} );

// add selectize tags.
if ( typeof $.fn.selectize !== 'undefined' ) {
    $( '#lazyblocks_category' ).selectize( {
        create: true,
    } );
    $( '#lazyblocks_keywords' ).selectize( {
        plugins: [ 'drag_drop', 'remove_button' ],
        delimiter: ',',
        maxItems: 3,
        selectOnTab: true,
        create: function( input ) {
            return {
                value: input,
                text: input,
            };
        },
    } );
    $( '#lazyblocks_supports_align' ).selectize( {
        plugins: [ 'drag_drop', 'remove_button' ],
        delimiter: ',',
        selectOnTab: true,
        create: function( input ) {
            return {
                value: input,
                text: input,
            };
        },
    } );
    $( '#lazyblocks_condition_post_types' ).selectize( {
        plugins: [ 'drag_drop', 'remove_button' ],
        delimiter: ',',
        selectOnTab: true,
        create: function( input ) {
            return {
                value: input,
                text: input,
            };
        },
    } );
    $( '#lazyblocks_keywords-selectized' ).on( 'keypress', function( e ) {
        if ( e.keyCode === 13 ) {
            e.preventDefault();
        }
    } );
}

// Tabs
$( document ).on( 'click', '.lzb-metabox-tabs .lzb-metabox-tabs-btn', function( e ) {
    e.preventDefault();

    const $btn = $( this );
    const $tabs = $btn.closest( '.lzb-metabox-tabs' );

    $btn.addClass( 'lzb-metabox-tabs-btn-active' )
        .siblings().removeClass( 'lzb-metabox-tabs-btn-active' );

    $tabs.find( '.lzb-metabox-tabs-content-item' )
        .removeClass( 'lzb-metabox-tabs-content-item-active' )
        .eq( $btn.index() )
        .addClass( 'lzb-metabox-tabs-content-item-active' );
} );

// CodeMirror
$( () => {
    if ( wp.codeEditor ) {
        const $editorHTML = $( '#lazyblocks_code_editor_html' );
        const $editorCSS = $( '#lazyblocks_code_editor_css' );
        const $frontendHTML = $( '#lazyblocks_code_frontend_html' );
        const $frontendCSS = $( '#lazyblocks_code_frontend_css' );

        const HTMLparams = Object.assign( {}, wp.codeEditor.defaultSettings );
        const CSSparams = Object.assign( {}, wp.codeEditor.defaultSettings );

        HTMLparams.codemirror.mode = 'htmlmixed';
        CSSparams.codemirror.mode = 'css';

        if ( $editorHTML.length ) {
            wp.codeEditor.initialize( $editorHTML[ 0 ], HTMLparams );
        }
        if ( $editorCSS.length ) {
            wp.codeEditor.initialize( $editorCSS[ 0 ], CSSparams );
        }
        if ( $frontendHTML.length ) {
            wp.codeEditor.initialize( $frontendHTML[ 0 ], HTMLparams );
        }
        if ( $frontendCSS.length ) {
            wp.codeEditor.initialize( $frontendCSS[ 0 ], CSSparams );
        }
    }
} );

/**
 * Controls
 */
const $controls = $( '#lazyblocks_controls .lzb-metabox' );

// new control template.
const controlNameTemplate = 'lazyblocks_controls[#{ID}]';
const controlTemplate = `
        <div class="lzb-metabox-control" data-control-id="#{ID}" data-control-name="${ controlNameTemplate }" data-control-type="#{type}">
            <div class="lzb-metabox">
                <input class="lzb-input" id="${ controlNameTemplate }[sort]" name="${ controlNameTemplate }[sort]" type="hidden" value="#{sort}">
                <input class="lzb-input" id="${ controlNameTemplate }[child_of]" name="${ controlNameTemplate }[child_of]" type="hidden" value="#{child_of}">

                <div class="lzb-metabox-control-handle"><span class="dashicons dashicons-menu"></span></div>

                <div class="lzb-metabox-label">
                    <label data-contain-val="[id='${ controlNameTemplate }[label]']" class="lzb-metabox-control-action-expand"></label>
                    <small data-contain-val="[id='${ controlNameTemplate }[name]']"></small>
                </div>
                <div>
                    <div class="lzb-metabox-control-info">
                        <div>
                            <small data-contain-val="[id='${ controlNameTemplate }[type]']"></small>
                        </div>
                        <div class="lzb-metabox-control-hide-from-repeater">
                            <small data-contain-val="[id='${ controlNameTemplate }[placement]']"></small>
                        </div>
                        <div class="lzb-metabox-control-hide-from-repeater">
                            <small data-cond="[id='${ controlNameTemplate }[save_in_meta]" data-contain-val="[id='${ controlNameTemplate }[save_in_meta_name]']"></small>
                            <small data-cond="[id='${ controlNameTemplate }[save_in_meta] != 1">-</small>
                        </div>
                    </div>
                    <div class="lzb-metabox lzb-metabox-container" data-cond="[id='${ controlNameTemplate }[type]'] == repeater"></div>
                    <div class="lzb-metabox lzb-metabox-container-add" data-cond="[id='${ controlNameTemplate }[type]'] == repeater">
                        <div class="lzb-metabox-add-control">
                            <button class="button button-secondary">+ Add Control</button>
                        </div>
                    </div>
                    <div class="lzb-metabox-control-actions">
                        <a href="#" class="lzb-metabox-control-action-expand lzb-metabox-control-action-expand-change-text">Expand</a>
                        <a href="#" class="lzb-metabox-control-action-remove">Delete</a>
                    </div>
                </div>
            </div>

            <div class="lzb-metabox-control-expanded">
                <!-- Label -->
                <div class="lzb-metabox">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[label]">Label</label>
                        <small>This is the name which will appear on the block edit control</small>
                    </div>
                    <div>
                        <input class="lzb-input" id="${ controlNameTemplate }[label]" name="${ controlNameTemplate }[label]" type="text" value="#{label}">
                    </div>
                </div>

                <!-- Name -->
                <div class="lzb-metabox">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[name]">Name</label>
                        <small>Unique control name, no spaces. Underscores and dashes allowed</small>
                    </div>
                    <div>
                        <input class="lzb-input" id="${ controlNameTemplate }[name]" name="${ controlNameTemplate }[name]" type="text" value="#{name}">
                    </div>
                </div>

                <!-- Type -->
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
                                <option value="range" #{type:selected?range}>Range</option>
                                <option value="url" #{type:selected?url}>URL</option>
                                <option value="email" #{type:selected?email}>Email</option>
                                <option value="password" #{type:selected?password}>Password</option>
                            </optgroup>
                            <optgroup label="Content">
                                <option value="image" #{type:selected?image}>Image</option>
                                <option value="gallery" #{type:selected?gallery}>Gallery</option>
                                <option value="rich_text" #{type:selected?rich_text}>Rich Text (WYSIWYG)</option>
                                <option value="code_editor" #{type:selected?code_editor}>Code Editor</option>
                                <option value="inner_blocks" class="lzb-metabox-control-hide-from-repeater" #{type:selected?inner_blocks}>Inner Blocks</option>
                            </optgroup>
                            <optgroup label="Choice">
                                <option value="select" #{type:selected?select}>Select</option>
                                <option value="checkbox" #{type:selected?checkbox}>Checkbox</option>
                                <option value="toggle" #{type:selected?toggle}>Toggle</option>
                            </optgroup>
                            <optgroup label="Advanced">
                                <option value="color" #{type:selected?color}>Color Picker</option>
                                <option value="date_time" #{type:selected?date_time}>Date Time Picker</option>
                            </optgroup>
                            <optgroup label="Layout" class="lzb-metabox-control-hide-from-repeater">
                                <option value="repeater" #{type:selected?repeater}>Repeater</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <!-- Choices & Allow Null for Select control -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == select">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[choices]">Choices</label>
                        <small>Enter each choice on a new line.</small>
                        <small>For more control, you may specify both a value and label like this:</small>
                        <small>value : Label</small>
                    </div>
                    <div>
                        <div class="lzb-choices-hidden-array" data-name="${ controlNameTemplate }[choices]"></div>
                        <textarea class="lzb-textarea" id="${ controlNameTemplate }[choices]" rows="6">#{choices}</textarea>
                    </div>
                </div>
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == select">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[allow_null]">Allow Null</label>
                        <small>Will be added option that allow you to reset selected option value to null</small>
                    </div>
                    <div>
                        <label>
                            <input type="hidden" name="${ controlNameTemplate }[allow_null]" id="${ controlNameTemplate }[allow_null]_hidden" value="false">
                            <input class="lzb-input" type="checkbox" name="${ controlNameTemplate }[allow_null]" id="${ controlNameTemplate }[allow_null]" value="true" #{allow_null:checked?true}>
                            Yes
                        </label>
                    </div>
                </div>

                <!-- Min, Max, Step for Number and Range controls -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == number || [id='${ controlNameTemplate }[type]'] == range">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[min]">Min, Max, Step</label>
                    </div>
                    <div class="lzb-metabox-input-group">
                        <input class="lzb-input" id="${ controlNameTemplate }[min]" name="${ controlNameTemplate }[min]" type="number" value="#{min}" placeholder="Min" step="#{step}">
                        <input class="lzb-input" id="${ controlNameTemplate }[max]" name="${ controlNameTemplate }[max]" type="number" value="#{max}" placeholder="Max" step="#{step}">
                        <input class="lzb-input" id="${ controlNameTemplate }[step]" name="${ controlNameTemplate }[step]" type="text" value="#{step}" placeholder="Step">
                    </div>
                </div>

                <!-- Picker type for Date Time Picker control -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == date_time">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[date_time_picker]">Picker</label>
                    </div>
                    <div>
                        <select class="lzb-select" name="${ controlNameTemplate }[date_time_picker]" id="${ controlNameTemplate }[date_time_picker]">
                            <option value="date_time" #{type:selected?date_time}>Date + Time</option>
                            <option value="date" #{type:selected?date}>Date</option>
                            <option value="time" #{type:selected?time}>Time</option>
                        </select>
                    </div>
                </div>

                <!-- Multiline for Rich Text control -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == rich_text">
                    <div class="lzb-metabox-label"></div>
                    <div>
                        <label>
                            <input type="hidden" name="${ controlNameTemplate }[multiline]" id="${ controlNameTemplate }[multiline]_hidden" value="false">
                            <input class="lzb-input" type="checkbox" name="${ controlNameTemplate }[multiline]" id="${ controlNameTemplate }[multiline]" value="true" #{multiline:checked?true}>
                            Multiline
                        </label>
                    </div>
                </div>

                <!-- Default value -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] != image && [id='${ controlNameTemplate }[type]'] != gallery && [id='${ controlNameTemplate }[type]'] != code_editor && [id='${ controlNameTemplate }[type]'] != inner_blocks && [id='${ controlNameTemplate }[type]'] != checkbox && [id='${ controlNameTemplate }[type]'] != toggle && [id='${ controlNameTemplate }[type]'] != repeater">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[default]">Default value</label>
                        <small>Appears when inserting a new block</small>
                    </div>
                    <div>
                        <input class="lzb-input" id="${ controlNameTemplate }[default]" name="${ controlNameTemplate }[default]" type="text" value="#{default}">
                    </div>
                </div>

                <!-- Checked for Checkbox and Toggle controls -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == checkbox || [id='${ controlNameTemplate }[type]'] == toggle">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[checked]">Checked</label>
                    </div>
                    <div>
                        <label>
                            <input type="hidden" name="${ controlNameTemplate }[checked]" id="${ controlNameTemplate }[checked]_hidden" value="false">
                            <input class="lzb-input" type="checkbox" name="${ controlNameTemplate }[checked]" id="${ controlNameTemplate }[checked]" value="true" #{checked:checked?true}>
                            Yes
                        </label>
                    </div>
                </div>

                <!-- Placeholder for text controls -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] == text || [id='${ controlNameTemplate }[type]'] == textarea || [id='${ controlNameTemplate }[type]'] == number || [id='${ controlNameTemplate }[type]'] == email || [id='${ controlNameTemplate }[type]'] == password">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[placeholder]">Placeholder</label>
                    </div>
                    <div>
                        <input class="lzb-input" id="${ controlNameTemplate }[placeholder]" name="${ controlNameTemplate }[placeholder]" type="text" value="#{placeholder}">
                    </div>
                </div>

                <!-- Help text -->
                <div class="lzb-metabox" data-cond="[id='${ controlNameTemplate }[type]'] != inner_blocks && [id='${ controlNameTemplate }[type]'] != repeater">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[help]">Help text</label>
                        <small>Instructions under control</small>
                    </div>
                    <div>
                        <textarea class="lzb-textarea" id="${ controlNameTemplate }[help]" name="${ controlNameTemplate }[help]" rows="6">#{help}</textarea>
                    </div>
                </div>

                <!-- Placement -->
                <div class="lzb-metabox lzb-metabox-control-hide-from-repeater">
                    <div class="lzb-metabox-label">
                        <label for="${ controlNameTemplate }[placement]">Placement</label>
                    </div>
                    <div>
                        <select class="lzb-select" name="${ controlNameTemplate }[placement]" id="${ controlNameTemplate }[placement]">
                            <option value="content" #{placement:selected?content}>Content</option>
                            <option value="inspector" #{placement:selected?inspector}>Inspector</option>
                            <option value="both" #{placement:selected?both}>Both</option>
                            <option value="nowhere" #{placement:selected?nowhere}>Hidden</option>
                        </select>
                    </div>
                </div>

                <!-- Meta -->
                <div class="lzb-metabox lzb-metabox-control-hide-from-repeater">
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

// init sortablejs.
function initControlsSortable() {
    if ( ! window.Sortable ) {
        return;
    }

    $controls.find( '.lzb-metabox-controls, .lzb-metabox-container' ).each( function() {
        new window.Sortable( this, {
            group: {
                name: 'lzb-controls',
                put: function( to, from, item ) {
                    // prevent adding inner blocks inside repeater.
                    return 'inner_blocks' !== $( item ).attr( 'data-control-type' );
                },
            },
            draggable: '.lzb-metabox-control',
            filter: '.lzb-input, .lzb-textarea, .lzb-select',
            handle: '.lzb-metabox-control-handle',
            preventOnFilter: false,
            animation: 150,
            onSort: function() {
                let i = 1;
                $controls.find( '.lzb-metabox-controls [data-control-name]' ).each( function() {
                    const $control = $( this );
                    const controlName = $control.attr( 'data-control-name' );

                    // Update sort variable.
                    $control.find( `[name="${ controlName }[sort]"]` ).val( i++ );

                    // Update child_of variable.
                    const $parent = $control.closest( '[data-control-id]' ).parents( '[data-control-id]:eq(0)' );
                    const parentId = $parent.length ? $parent.attr( 'data-control-id' ) : '';

                    $control.find( `[name="${ controlName }[child_of]"]` ).val( parentId );
                } );
                prepareInnerBlocks();
            },
        } );
    } );
}

// prepare inner blocks control.
function prepareInnerBlocks() {
    const $selects = $controls.find( '.lzb-select' ).filter( function() {
        return /^lazyblocks_controls(.*)\[type\]$/.test( $( this ).attr( 'name' ) );
    } );
    const innerBlocksControlExist = $selects.filter( function() {
        return 'inner_blocks' === $( this ).val();
    } ).length;

    $selects.each( function() {
        const $this = $( this );
        const isInnerBlock = 'inner_blocks' === $this.val();

        if ( ! isInnerBlock ) {
            if ( innerBlocksControlExist ) {
                $this.find( 'option[value="inner_blocks"]' ).attr( 'disabled', 'disabled' );
            } else {
                $this.find( 'option[value="inner_blocks"]' ).removeAttr( 'disabled' );
            }
        }
    } );
}

// add control.
function addControl( controlData ) {
    const {
        ID,
        choices,
    } = controlData;

    const childOf = controlData.child_of;

    if ( ID && ID === 'uniq' ) {
        controlData.ID = getUID();
        while ( $( `[data-control-id="control_${ ID }"]` ).length ) {
            controlData.ID = getUID();
        }
        controlData.ID = `control_${ controlData.ID }`;
    }
    if ( controlData.ID ) {
        let newControl = controlTemplate;

        // prepare choices to multiline string.
        if ( choices && Array.isArray( choices ) ) {
            let strChoices = '';
            choices.forEach( ( choice ) => {
                strChoices += strChoices ? '\n' : '';
                if ( choice.value === choice.label ) {
                    strChoices += `${ choice.value }`;
                } else {
                    strChoices += `${ choice.value } : ${ choice.label }`;
                }
            } );
            controlData.choices = strChoices;
        }

        // add template values.
        newControl = stringTemplate( newControl, controlData );

        // append new control.
        let $appendTo;
        if ( childOf ) {
            $appendTo = $controls.find( `[data-control-id="${ childOf }"] .lzb-metabox-container:eq(0)` );
        }
        if ( ! $appendTo ) {
            $appendTo = $controls.find( '.lzb-metabox-controls' );
        }
        $appendTo.append( newControl );

        // expand.
        $controls.find( `[data-control-id="${ controlData.ID }"] .lzb-metabox-control-action-expand:eq(0)` ).click();

        // conditionize init.
        $controls.find( `[data-control-id="${ controlData.ID }"]` ).find( 'input, select, textarea' ).change();
    }
}

// remove control.
function removeControl( ID ) {
    $controls.find( `[data-control-id="${ ID }"]` ).remove();
}

// contain values
function updateContainValues() {
    $controls.find( '[data-contain-val]' ).each( function() {
        const $this = $( this );
        const $listenTo = $( $this.attr( 'data-contain-val' ) );
        let result;

        if ( $listenTo.is( '[type="radio"], [type="checkbox"]' ) ) {
            result = $listenTo.is( ':checked' ) ? 'true' : 'false';
        } else if ( $listenTo.is( 'textarea, select, input' ) ) {
            result = $listenTo.val();
        }

        $this.html( result );
    } );
}

// update choices array (to save as array and not as multiline string)
function updateChoicesArray() {
    $controls.find( '.lzb-choices-hidden-array' ).each( function() {
        const $this = $( this );
        const $textarea = $this.next( 'textarea' );
        const textareaVal = $textarea.val();
        const name = $this.attr( 'data-name' );
        let newInputs = '';

        let k = 0;
        textareaVal.split( '\n' ).forEach( ( val ) => {
            const split = val.split( ' : ' );
            const value = split[ 0 ].replace( /\n/g, '' );
            const label = ( split[ 1 ] || split[ 0 ] ).replace( /\n/g, '' );

            if ( value ) {
                newInputs += `<input type="hidden" name="${ name }[${ k }][value]" value="${ value }">`;
                newInputs += `<input type="hidden" name="${ name }[${ k }][label]" value="${ label }">`;

                k++;
            }
        } );

        $this.html( newInputs );
    } );
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
    $controls.html( startingTemplate );

    // add existing controls.
    Object.keys( data.controls ).map( ( key ) => {
        if ( ! data.controls[ key ].child_of ) {
            addControl( Object.assign( { ID: key }, data.controls[ key ] ) );
        }
    } );
    // inner blocks
    Object.keys( data.controls ).map( ( key ) => {
        if ( data.controls[ key ].child_of ) {
            addControl( Object.assign( { ID: key }, data.controls[ key ] ) );
        }
    } );

    // events.

    // contain values and choices
    updateContainValues();
    updateChoicesArray();
    $controls.on( 'change', 'input, select, textarea', function() {
        updateContainValues();
        updateChoicesArray();
        prepareInnerBlocks();
    } );

    // add control.
    $controls.on( 'click', '.lzb-metabox-add-control button', function( e ) {
        e.preventDefault();

        const childOf = $( this ).closest( '[data-control-id]' ).attr( 'data-control-id' );

        addControl( {
            ID: 'uniq',
            child_of: childOf || '',
        } );
        prepareInnerBlocks();
        initControlsSortable();
    } );
    prepareInnerBlocks();
    initControlsSortable();

    // remove control
    $controls.on( 'click', '.lzb-metabox-control-action-remove', function( e ) {
        e.preventDefault();

        removeControl( $( this ).closest( '[data-control-id]' ).attr( 'data-control-id' ) );
        prepareInnerBlocks();
        initControlsSortable();
    } );

    // expand collapsed options.
    $controls.on( 'click', '.lzb-metabox-control-action-expand', function( e ) {
        e.preventDefault();

        const $control = $( this ).closest( '[data-control-id]' );
        const ID = $control.attr( 'data-control-id' );
        const expanded = $control.data( 'expanded' );

        // prevent expanding child controls.
        function expandFilter() {
            return $( this ).closest( '[data-control-id]' ).attr( 'data-control-id' ) === ID;
        }

        if ( expanded ) {
            $control.find( '.lzb-metabox-control-expanded' ).filter( expandFilter ).stop().slideUp( 200 );
            $control.find( '.lzb-metabox-control-collapsed' ).filter( expandFilter ).stop().slideDown( 200 );
            $control.find( '.lzb-metabox-control-action-expand-change-text' ).filter( expandFilter ).text( 'Expand' );
        } else {
            $control.find( '.lzb-metabox-control-expanded' ).filter( expandFilter ).stop().slideDown( 200 );
            $control.find( '.lzb-metabox-control-collapsed' ).filter( expandFilter ).stop().slideUp( 200 );
            $control.find( '.lzb-metabox-control-action-expand-change-text' ).filter( expandFilter ).text( 'Collapse' );
        }

        $control.data( 'expanded', ! expanded );
    } );

    // slugify
    $controls.on( 'blur', '.lzb-metabox input', function( e ) {
        e.preventDefault();
        const $this = $( this );
        const name = $this.attr( 'name' );
        let $nameInput = false;

        // add slug if don't exists.
        if ( /\[label]$/.test( name ) ) {
            $nameInput = $( `[name="${ name.replace( /\[label]$/, '[name]' ) }"]` );

            if ( $nameInput.val() ) {
                $nameInput = false;
            } else {
                $nameInput.val( $this.val() ).change();
            }
        }

        // slugify name control after user changed it.
        if ( /\[name]$/.test( name ) ) {
            $nameInput = $this;
        }

        if ( $nameInput && $nameInput.length ) {
            $nameInput.val( slugify( $nameInput.val(), {
                replacement: '_',
                lower: true,
            } ) ).change();
        }
    } );
}

// add block slug if input is empty and user clicked on publish.
const $titleInput = $( '[name="post_title"]' );
const $slugInput = $( '#lazyblocks_slug' );
$( document ).on( 'click', '#publish', function( e ) {
    let slugVal = $slugInput.val();
    if ( ! $slugInput.val() && $titleInput.val() ) {
        slugVal = slugify( $titleInput.val(), {
            replacement: '-',
            lower: true,
            remove: /^[0-9-*+~.\$(_)#&\|'"!:;@/\\]/g,
        } );
        $slugInput.val( slugVal ).change();
    }

    // slug validation
    if ( ! /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( `lazyblock/${ slugVal }` ) ) {
        e.preventDefault();

        if ( ! $slugInput.parent().next( '.notice' ).length ) {
            $slugInput.parent().after( `<div class="notice error"><p>${ 'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block' }</p></div>` );
        }
    }
} );

/**
 * Templates
 */
function workWithTemplates() {
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
            $( '.lzb-select' ).each( function() {
                const $select = $( this );
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

if ( wp.domReady && wp.api && wp.blocks && $( 'body.post-type-lazyblocks_templates' ).length ) {
    wp.domReady( () => {
        wp.api.loadPromise.done( function() {
            if ( ! wp.api.models.Lazyblocks_templates ) {
                return;
            }

            workWithTemplates();
        } );
    } );
}
