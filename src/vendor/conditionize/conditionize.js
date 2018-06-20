(function($) {
    if (typeof $ === 'undefined' && typeof $.fn.conditionize !== 'undefined') {
        return;
    }

    // https://gist.github.com/aaditmshah/6683499
    function Parser(e){this.table=e}Parser.prototype.parse=function(e){for(var r=e.length,t=this.table,s=[],a=[],h=0;r>h;){var i=e[h++];switch(i){case"(":a.unshift(i);break;case")":for(;a.length;){var i=a.shift();if("("===i)break;s.push(i)}if("("!==i)throw new Error("Mismatched parentheses.");break;default:if(t.hasOwnProperty(i)){for(;a.length;){var f=a[0];if("("===f)break;var n=t[i],o=n.precedence,c=t[f].precedence;if(o>c||o===c&&"right"===n.associativity)break;s.push(a.shift())}a.unshift(i)}else s.push(i)}}for(;a.length;){var i=a.shift();if("("===i)throw new Error("Mismatched parentheses.");s.push(i)}return s};

    var sortRelational = {
        precedence: 3,
        associativity: "left"
    };
    var sortEquality = {
        precedence: 2,
        associativity: "left"
    };

    // available relations
    var relations = {
        '==': {
            eval: function (a, b) {
                return a == b;
            },
            sort: sortEquality
        },
        '!=': {
            eval: function (a, b) {
                return a != b;
            },
            sort: sortEquality
        },
        '*=': {
            eval: function (a, b) {
                return a.indexOf(b) !== -1;
            },
            sort: sortEquality
        },
        '<=': {
            eval: function (a, b) {
                return a <= b;
            },
            sort: sortRelational
        },
        '>=': {
            eval: function (a, b) {
                return a >= b;
            },
            sort: sortRelational
        },
        '<': {
            eval: function (a, b) {
                return a < b;
            },
            sort: sortRelational
        },
        '>': {
            eval: function (a, b) {
                return a > b;
            },
            sort: sortRelational
        },
        '&&': {
            eval: function (a, b) {
                return a && b;
            },
            sort: {
                precedence: 1,
                associativity: "right"
            }
        },
        '||': {
            eval: function (a, b) {
                return a || b;
            },
            sort: {
                precedence: 0,
                associativity: "right"
            }
        }
    };

    // check if is valid jquery selector
    function isValidSelector (selector) {
        if (
            typeof selector !== 'string'
            || $.isNumeric(selector)
            || selector == 'false'
            || selector == 'true'
            || selector == false
            || selector == true) {
            return false;
        }
        try {
            var $element = $(selector);
        } catch(error) {
            return false;
        }
        return true;
    }

    // eval
    function condition (a, operator, b) {
        if (operator in relations) {
            a = a === 'false' ? false : a === 'true' ? true : a;
            b = b === 'false' ? false : b === 'true' ? true : b;
            return relations[operator].eval(a, b);
        }
        return false;
    }

    // compare items
    function compare (arr) {
        if (arr instanceof Array) {
            if (arr.length === 3) {
                arr[0] = compare(arr[0]);
                if (arr[2] instanceof Array) {
                    arr[2] = compare(arr[2]);
                }

                return condition(arr[0], arr[1], arr[2]);
            } else if (arr.length === 1) {
                return compare(arr[0]);
            }
            return false;
        } else if (isValidSelector(arr)) {
            var $listenTo = $(arr);
            var result = false;

            if ($listenTo.is('[type=radio], [type=checkbox]')) {
                result = $listenTo.is(':checked');
            } else if ($listenTo.is('textarea, select, input')) {
                result = $listenTo.val();
            }

            return result;
        }
        return arr;
    }

    // parse condition
    function checkCondition (str) {
        var tokens = str.match(/[^\s]+/g), token;

        var parserRelations = {};
        for (var k in relations) {
            parserRelations[k] = relations[k].sort;
        }
        var parser = new Parser(parserRelations);

        tokens = parser.parse(tokens);

        var stack = [], length = tokens.length, index = 0;

        while (index < length) {
            token = tokens[index++];

            if(token in relations) {
                var b = stack.pop();
                var a = stack.pop();
                stack.push([a, token, b]);
            } else {
                stack.push(token);
            }
        }

        return compare(stack.length && stack[0]);
    }

    // conditionize
    $.fn.conditionize = function(options) {

        var settings = $.extend({
            selector: '[data-cond]'
        }, options);

        // check conditions in section
        function check ($items) {
            $items.each(function () {
                var conditionString = $(this).data('cond').toString();
                var conditionResult = checkCondition(conditionString);
                $(this)[conditionResult ? 'show' : 'hide']();
            });
        }

        return this.each(function() {
            var $section = $(this);

            // hide all controls by default
            $section.find(settings.selector).hide();

            // event listener
            $section.on('change', 'input, select, textarea', function () {
                check($section.find(settings.selector));
            });
            check($section.find(settings.selector));
        });
    }
}(jQuery));