(()=>{var e={1991:(e,t)=>{var n;!function(){"use strict";var o=function(){function e(){}function t(e,t){for(var n=t.length,o=0;o<n;++o)l(e,t[o])}e.prototype=Object.create(null);var n={}.hasOwnProperty,o=/\s+/;function l(e,l){if(l){var r=typeof l;"string"===r?function(e,t){for(var n=t.split(o),l=n.length,r=0;r<l;++r)e[n[r]]=!0}(e,l):Array.isArray(l)?t(e,l):"object"===r?function(e,t){if(t.toString===Object.prototype.toString||t.toString.toString().includes("[native code]"))for(var o in t)n.call(t,o)&&(e[o]=!!t[o]);else e[t.toString()]=!0}(e,l):"number"===r&&function(e,t){e[t]=!0}(e,l)}}return function(){for(var n=arguments.length,o=Array(n),l=0;l<n;l++)o[l]=arguments[l];var r=new e;t(r,o);var a=[];for(var i in r)r[i]&&a.push(i);return a.join(" ")}}();e.exports?(o.default=o,e.exports=o):void 0===(n=function(){return o}.apply(t,[]))||(e.exports=n)}()}},t={};function n(o){var l=t[o];if(void 0!==l)return l.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";const e=window.wp.element,t=window.wp.hooks;function o(){return o=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},o.apply(this,arguments)}var l=n(1991),r=n.n(l);function a(t){const{label:n,help:l,className:a,children:i,...c}=t;return(0,e.createElement)("div",o({},c,{className:r()("lazyblocks-component-base-control",a)}),n?(0,e.createElement)("div",{className:"lazyblocks-component-base-control__label"},n):null,i,l?(0,e.createElement)("div",{className:"lazyblocks-component-base-control__help"},l):null)}const{controls:i={}}=window.lazyblocksConstructorData||window.lazyblocksGutenberg;const c=window.wp.i18n,s=window.wp.data,d=window.wp.components;function u(t){let n="lzb-component-modal";return t.position&&(n=r()(n,`lzb-component-modal-position-${t.position}`)),t.size&&(n=r()(n,`lzb-component-modal-size-${t.size}`)),n=r()(n,t.className),(0,e.createElement)(d.Modal,o({},t,{className:n}),t.children)}function p(t){const n=(0,s.useSelect)((e=>e("core/block-editor").getSettings().styles));return(0,e.useEffect)((()=>{const{baseURL:e,suffix:o,settings:l}=window.wpEditorL10n.tinymce;return window.tinymce.EditorManager.overrideDefaults({base_url:e,suffix:o}),window.wp.oldEditor.initialize(t.id,{tinymce:{...l,setup(e){e.on("init",(()=>{const t=e.getDoc();n.forEach((({css:e})=>{const n=t.createElement("style");n.innerHTML=e,t.head.appendChild(n)}))}))}}}),()=>{window.wp.oldEditor.remove(t.id)}}),[]),(0,e.createElement)("textarea",{...t})}function m(t){const{label:n,editorId:o,content:l,onChange:r}=t,[a,i]=(0,e.useState)(!1);return(0,e.createElement)(e.Fragment,null,(0,e.createElement)("div",null),(0,e.createElement)(d.Button,{onClick:()=>i(!a),variant:"secondary"},(0,c.__)("Open Editor","lazy-blocks")),a?(0,e.createElement)(u,{title:n||(0,c.__)("Editor","lazy-blocks"),onRequestClose:()=>i(!a),id:`modal-${o}`,className:"lazyblocks-control-classic_editor-modal",shouldCloseOnClickOutside:!1},(0,e.createElement)(p,{id:o,defaultValue:l}),(0,e.createElement)(d.Flex,{className:"block-editor-freeform-modal__actions",justify:"flex-end",expanded:!1},(0,e.createElement)(d.FlexItem,null,(0,e.createElement)(d.Button,{variant:"tertiary",onClick:()=>i(!1)},(0,c.__)("Cancel","lazy-blocks"))),(0,e.createElement)(d.FlexItem,null,(0,e.createElement)(d.Button,{variant:"primary",onClick:()=>{r(window.wp.oldEditor.getContent(o)),i(!1)}},(0,c.__)("Save","lazy-blocks"))))):null)}(0,t.addFilter)("lzb.editor.control.classic_editor.render","lzb.editor",((t,n,o)=>{const l=`${n.placement}-${o.clientId}-${n.uniqueId}-${n.data.name}-${n.childIndex||0}`,c=function(e,{className:t,...n}={}){const o=(l=e.data.type)&&i[l]?i[l]:!!i.undefined&&i.undefined;var l;return{label:!!o.restrictions.label_settings&&e.data.label,help:!!o.restrictions.help_settings&&e.data.help,className:r()(`lazyblocks-control lazyblocks-control-${e.data.type}`,t),"data-lazyblocks-control-name":e.data.name,...n}}(n);return(0,e.createElement)(a,{key:l,...c},(0,e.createElement)(m,{label:c.label,content:n.getValue(),onChange:e=>{n.onChange(e)},editorId:l}))}))})()})();