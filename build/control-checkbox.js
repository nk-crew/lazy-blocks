!function(){var e={1991:function(e,t){var n;!function(){"use strict";var o=function(){function e(){}function t(e,t){for(var n=t.length,o=0;o<n;++o)l(e,t[o])}e.prototype=Object.create(null);var n={}.hasOwnProperty,o=/\s+/;function l(e,l){if(l){var r=typeof l;"string"===r?function(e,t){for(var n=t.split(o),l=n.length,r=0;r<l;++r)e[n[r]]=!0}(e,l):Array.isArray(l)?t(e,l):"object"===r?function(e,t){if(t.toString===Object.prototype.toString||t.toString.toString().includes("[native code]"))for(var o in t)n.call(t,o)&&(e[o]=!!t[o]);else e[t.toString()]=!0}(e,l):"number"===r&&function(e,t){e[t]=!0}(e,l)}}return function(){for(var n=arguments.length,o=Array(n),l=0;l<n;l++)o[l]=arguments[l];var r=new e;t(r,o);var a=[];for(var c in r)r[c]&&a.push(c);return a.join(" ")}}();e.exports?(o.default=o,e.exports=o):void 0===(n=function(){return o}.apply(t,[]))||(e.exports=n)}()}},t={};function n(o){var l=t[o];if(void 0!==l)return l.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,{a:t}),t},n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){"use strict";var e=window.wp.element,t=window.wp.i18n,o=window.wp.hooks,l=window.wp.components,r=n(1991),a=n.n(r);function c(t){const{label:n,help:o,className:l,children:r,...c}=t;return(0,e.createElement)("div",{...c,className:a()("lazyblocks-component-base-control",l)},n?(0,e.createElement)("div",{className:"lazyblocks-component-base-control__label"},n):null,r,o?(0,e.createElement)("div",{className:"lazyblocks-component-base-control__help"},o):null)}const{controls:s={}}=window.lazyblocksConstructorData||window.lazyblocksGutenberg;function i(e,{className:t,...n}={}){const o=(l=e.data.type)&&s[l]?s[l]:!!s.undefined&&s.undefined;var l;return{label:!!o.restrictions.label_settings&&e.data.label,help:!!o.restrictions.help_settings&&e.data.help,className:a()(`lazyblocks-control lazyblocks-control-${e.data.type}`,t),"data-lazyblocks-control-name":e.data.name,...n}}(0,o.addFilter)("lzb.editor.control.checkbox.render","lzb.editor",((t,n)=>(0,e.createElement)(c,{...i(n)},(0,e.createElement)(l.CheckboxControl,{label:n.data.alongside_text,checked:!!n.getValue(),onChange:n.onChange})))),(0,o.addFilter)("lzb.constructor.control.checkbox.settings","lzb.constructor",((n,o)=>{const{updateData:r,data:a}=o;return(0,e.createElement)(e.Fragment,null,(0,e.createElement)(l.PanelBody,null,(0,e.createElement)(l.TextControl,{label:(0,t.__)("Alongside Text","lazy-blocks"),help:(0,t.__)("Displays text alongside the checkbox","lazy-blocks"),value:a.alongside_text,onChange:e=>r({alongside_text:e})})),(0,e.createElement)(l.PanelBody,null,(0,e.createElement)(c,{id:"lazyblocks-control-checkbox-checked",label:(0,t.__)("Checked","lazy-blocks")},(0,e.createElement)(l.CheckboxControl,{id:"lazyblocks-control-checkbox-checked",label:(0,t.__)("Yes","lazy-blocks"),checked:"true"===a.checked,onChange:e=>r({checked:e?"true":"false"})}))))}))}()}();