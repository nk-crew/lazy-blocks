(()=>{var e={8655:(e,t)=>{var n;!function(){"use strict";var r=function(){function e(){}function t(e,t){for(var n=t.length,r=0;r<n;++r)a(e,t[r])}e.prototype=Object.create(null);var n={}.hasOwnProperty,r=/\s+/;function a(e,a){if(a){var o=typeof a;"string"===o?function(e,t){for(var n=t.split(r),a=n.length,o=0;o<a;++o)e[n[o]]=!0}(e,a):Array.isArray(a)?t(e,a):"object"===o?function(e,t){if(t.toString===Object.prototype.toString||t.toString.toString().includes("[native code]"))for(var r in t)n.call(t,r)&&(e[r]=!!t[r]);else e[t.toString()]=!0}(e,a):"number"===o&&function(e,t){e[t]=!0}(e,a)}}return function(){for(var n=arguments.length,r=Array(n),a=0;a<n;a++)r[a]=arguments[a];var o=new e;t(o,r);var l=[];for(var i in o)o[i]&&l.push(i);return l.join(" ")}}();e.exports?(r.default=r,e.exports=r):void 0===(n=function(){return r}.apply(t,[]))||(e.exports=n)}()}},t={};function n(r){var a=t[r];if(void 0!==a)return a.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";const e=window.wp.i18n,t=window.wp.hooks,r=window.wp.components;var a=n(8655),o=n.n(a),l=["label","help","className","children"];function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i.apply(null,arguments)}function c(e){var t=e.label,n=e.help,r=e.className,a=e.children,c=function(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.includes(r))continue;n[r]=e[r]}return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.includes(n)||{}.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}(e,l);return wp.element.createElement("div",i({},c,{className:o()("lazyblocks-component-base-control",r)}),t?wp.element.createElement("div",{className:"lazyblocks-component-base-control__label"},t):null,a,n?wp.element.createElement("div",{className:"lazyblocks-component-base-control__help"},n):null)}var u=(window.lazyblocksConstructorData||window.lazyblocksGutenberg).controls,s=void 0===u?{}:u;function p(e){return p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},p(e)}var m=["className"];function b(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function f(e,t,n){return(t=function(e){var t=function(e){if("object"!=p(e)||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var n=t.call(e,"string");if("object"!=p(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==p(t)?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function d(e,t,n){return""===t||isNaN(t)?{valid:!1}:""!==n.min&&t<parseInt(n.min,10)?{valid:!1,message:"Value must be greater than or equal to ".concat(parseInt(n.min,10),".")}:""!==n.max&&t>parseInt(n.max,10)?{valid:!1,message:"Value must be less than or equal to ".concat(parseInt(n.max,10),".")}:e}(0,t.addFilter)("lzb.editor.control.number.render","lzb.editor",(function(e,t){var n=t.data.characters_limit?parseInt(t.data.characters_limit,10):"";return wp.element.createElement(c,function(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=n.className,a=function(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.includes(r))continue;n[r]=e[r]}return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.includes(n)||{}.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}(n,m),l=(t=e.data.type)&&s[t]?s[t]:!!s.undefined&&s.undefined,i=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?b(Object(n),!0).forEach((function(t){f(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):b(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({label:!!l.restrictions.label_settings&&e.data.label,help:!!l.restrictions.help_settings&&e.data.help,className:o()("lazyblocks-control lazyblocks-control-".concat(e.data.type),r),"data-lazyblocks-control-name":e.data.name},a);return i}(t,{label:!1}),wp.element.createElement(r.TextControl,{type:"number",label:t.data.label,maxLength:n,min:t.data.min,max:t.data.max,step:t.data.step,placeholder:t.data.placeholder,value:t.getValue(),onChange:function(e){t.onChange(parseFloat(e))},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0}))})),(0,t.addFilter)("lzb.editor.control.number.validate","lzb.editor",d),(0,t.addFilter)("lzb.editor.control.range.validate","lzb.editor",d),(0,t.addFilter)("lzb.constructor.control.number.settings","lzb.constructor",(function(t,n){var a=n.updateData,o=n.data;return wp.element.createElement(wp.element.Fragment,null,wp.element.createElement(r.PanelBody,null,wp.element.createElement(r.TextControl,{label:(0,e.__)("Minimum Value","lazy-blocks"),type:"number",step:o.step,value:o.min,onChange:function(e){return a({min:e})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})),wp.element.createElement(r.PanelBody,null,wp.element.createElement(r.TextControl,{label:(0,e.__)("Maximum Value","lazy-blocks"),type:"number",step:o.step,value:o.max,onChange:function(e){return a({max:e})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})),wp.element.createElement(r.PanelBody,null,wp.element.createElement(r.TextControl,{label:(0,e.__)("Step Size","lazy-blocks"),type:"number",value:o.step,onChange:function(e){return a({step:e})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})),wp.element.createElement(r.PanelBody,null,wp.element.createElement(r.TextControl,{label:(0,e.__)("Placeholder","lazy-blocks"),value:o.placeholder,onChange:function(e){return a({placeholder:e})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})))}))})()})();