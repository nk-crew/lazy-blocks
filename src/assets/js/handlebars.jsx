import Handlebars from 'handlebars';

// truncate
// {{truncate 'string' 2 'true'}}
Handlebars.registerHelper( 'truncate', ( str, len, ellipsis = 'true' ) => {
    if ( str && len && str.length > len ) {
        let newStr = str.substr( 0, len + 1 );

        while ( newStr.length ) {
            const ch = newStr.substr( -1 );
            newStr = newStr.substr( 0, -1 );

            if ( ch === ' ' ) {
                break;
            }
        }

        if ( newStr === '' ) {
            newStr = str.substr( 0, len );
        }

        return new Handlebars.SafeString( newStr + ( 'true' === ellipsis ? '...' : '' ) );
    }
    return str;
} );

// compare.
// {{#compare 1 '===' 2}} Show if true {{/compare}}
// slightly changed https://gist.github.com/doginthehat/1890659
Handlebars.registerHelper( 'compare', ( lvalue, operator, rvalue, options ) => {
    if ( arguments.length < 3 ) {
        // eslint-disable-next-line
        console.error( 'Handlerbars Helper \'compare\' needs 2 parameters' );
        return options.inverse( this );
    }

    if ( options === undefined ) {
        options = rvalue;
        rvalue = operator;
        operator = '===';
    }

    let result = false;

    switch ( operator ) {
    case '==':
        // eslint-disable-next-line
        result = lvalue == rvalue;
        break;
    case '===':
        result = lvalue === rvalue;
        break;
    case '!=':
        // eslint-disable-next-line
        result = lvalue != rvalue;
        break;
    case '!==':
        result = lvalue !== rvalue;
        break;
    case '<':
        result = lvalue < rvalue;
        break;
    case '>':
        result = lvalue > rvalue;
        break;
    case '<=':
        result = lvalue <= rvalue;
        break;
    case '>=':
        result = lvalue >= rvalue;
        break;
    case '&&':
        result = lvalue && rvalue;
        break;
    case '||':
        result = lvalue || rvalue;
        break;
    case 'typeof':
        result = typeof lvalue === rvalue;
        break;
    default:
        // eslint-disable-next-line
        console.error( 'Handlerbars Helper \'compare\' doesn\'t know the operator ' + operator );
        break;
    }

    if ( result ) {
        return options.fn( this );
    }

    return options.inverse( this );
} );

// math
// {{math 1 '+' 2}}
// https://stackoverflow.com/questions/33059203/error-missing-helper-in-handlebars-js/46317662#46317662
Handlebars.registerHelper( 'math', ( lvalue, operator, rvalue ) => {
    lvalue = parseFloat( lvalue );
    rvalue = parseFloat( rvalue );

    let result = '';

    switch ( operator ) {
    case '+':
        result = lvalue + rvalue;
        break;
    case '-':
        result = lvalue - rvalue;
        break;
    case '*':
        result = lvalue * rvalue;
        break;
    case '/':
        result = lvalue / rvalue;
        break;
    case '%':
        result = lvalue % rvalue;
        break;
    }

    return result;
} );

// date_i18n
// {{date_i18n 'F j, Y H:i' '2018-09-16 15:35'}}
Handlebars.registerHelper( 'date_i18n', ( format, time ) => {
    if ( window.date_i18n ) {
        return window.date_i18n( format, new Date( time ) );
    }
    return time;
} );

export default Handlebars;
