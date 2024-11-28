(()=>{var e={8655:(e,t)=>{var r;!function(){"use strict";var n=function(){function e(){}function t(e,t){for(var r=t.length,n=0;n<r;++n)o(e,t[n])}e.prototype=Object.create(null);var r={}.hasOwnProperty,n=/\s+/;function o(e,o){if(o){var l=typeof o;"string"===l?function(e,t){for(var r=t.split(n),o=r.length,l=0;l<o;++l)e[r[l]]=!0}(e,o):Array.isArray(o)?t(e,o):"object"===l?function(e,t){if(t.toString===Object.prototype.toString||t.toString.toString().includes("[native code]"))for(var n in t)r.call(t,n)&&(e[n]=!!t[n]);else e[t.toString()]=!0}(e,o):"number"===l&&function(e,t){e[t]=!0}(e,o)}}return function(){for(var r=arguments.length,n=Array(r),o=0;o<r;o++)n[o]=arguments[o];var l=new e;t(l,n);var a=[];for(var i in l)l[i]&&a.push(i);return a.join(" ")}}();e.exports?(n.default=n,e.exports=n):void 0===(r=function(){return n}.apply(t,[]))||(e.exports=r)}()}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var l=t[n]={exports:{}};return e[n](l,l.exports,r),l.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";const e=window.wp.i18n,t=window.wp.hooks,n=window.wp.components;var o=r(8655),l=r.n(o),a=["label","help","className","children"];function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},i.apply(null,arguments)}function c(e){var t=e.label,r=e.help,n=e.className,o=e.children,c=function(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r={};for(var n in e)if({}.hasOwnProperty.call(e,n)){if(t.includes(n))continue;r[n]=e[n]}return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.includes(r)||{}.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}(e,a);return wp.element.createElement("div",i({},c,{className:l()("lazyblocks-component-base-control",n)}),t?wp.element.createElement("div",{className:"lazyblocks-component-base-control__label"},t):null,o,r?wp.element.createElement("div",{className:"lazyblocks-component-base-control__help"},r):null)}var u=(window.lazyblocksConstructorData||window.lazyblocksGutenberg).controls,s=void 0===u?{}:u;function p(e){return p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},p(e)}var f=["className"];function b(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function m(e,t,r){return(t=function(e){var t=function(e){if("object"!=p(e)||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var r=t.call(e,"string");if("object"!=p(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==p(t)?t:t+""}(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}(0,t.addFilter)("lzb.editor.control.email.render","lzb.editor",(function(e,t){var r=t.data.characters_limit?parseInt(t.data.characters_limit,10):"";return wp.element.createElement(c,function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.className,o=function(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r={};for(var n in e)if({}.hasOwnProperty.call(e,n)){if(t.includes(n))continue;r[n]=e[n]}return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.includes(r)||{}.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}(r,f),a=(t=e.data.type)&&s[t]?s[t]:!!s.undefined&&s.undefined,i=function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?b(Object(r),!0).forEach((function(t){m(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):b(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({label:!!a.restrictions.label_settings&&e.data.label,help:!!a.restrictions.help_settings&&e.data.help,className:l()("lazyblocks-control lazyblocks-control-".concat(e.data.type),n),"data-lazyblocks-control-name":e.data.name},o);return i}(t,{label:!1}),wp.element.createElement(n.TextControl,{type:"email",label:t.data.label,maxLength:r,placeholder:t.data.placeholder,value:t.getValue(),onChange:t.onChange,__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0}))})),(0,t.addFilter)("lzb.editor.control.email.validate","lzb.editor",(function(e,t){return t?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?e:{valid:!1,message:"Please enter a valid email address."}:{valid:!1}})),(0,t.addFilter)("lzb.constructor.control.email.settings","lzb.constructor",(function(t,r){var o=r.updateData,l=r.data;return wp.element.createElement(wp.element.Fragment,null,wp.element.createElement(n.PanelBody,null,wp.element.createElement(n.TextControl,{label:(0,e.__)("Placeholder","lazy-blocks"),value:l.placeholder,onChange:function(e){return o({placeholder:e})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})),wp.element.createElement(n.PanelBody,null,wp.element.createElement(n.TextControl,{label:(0,e.__)("Characters Limit","lazy-blocks"),help:(0,e.__)("Maximum number of characters allowed. Leave blank to no limit.","lazy-blocks"),value:l.characters_limit?parseInt(l.characters_limit,10):"",type:"number",min:0,max:524288,onChange:function(e){return o({characters_limit:"".concat(e)})},__next40pxDefaultSize:!0,__nextHasNoMarginBottom:!0})))}))})()})();