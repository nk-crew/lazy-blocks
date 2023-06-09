// translators: %1$s - control name.
(0,B.__)('Control "%1$s"',"lazy-blocks"),r.label)})})),e.length&&i(null,e)}}},identifierRegexps:[/\$/]}),(0,H.addCompleter)({getCompletions(e,t,n,r,i){if("lzb-editor-html"===e.id){const{getBlockData:e}=(0,l.select)("lazy-blocks/block-data"),t=e();if(t.controls){const e=[];Object.keys(t.controls).forEach((n=>{const r=t.controls[n];r.name&&!r.child_of&&e.push({caption:`{{${r.name}}}`,value:`{{${r.name}}}`,meta:(0,B.sprintf)(
// translators: %1$s - control name.
(0,B.__)('Control "%1$s"',"lazy-blocks"),r.label)})})),e.length&&i(null,e)}}},identifierRegexps:[/\{/]});const Wc=window.wp.compose;function Bc(e){const{data:t,codeContext:n}=e,[r,i]=(0,O.useState)(""),o=(0,O.useRef)(!0),s=(0,O.useRef)(),a=(0,O.useRef)(),l=(0,O.useCallback)((()=>{const e={};return t.controls&&Object.values(t.controls).forEach((t=>{t.name&&!t.child_of&&(e[t.name]=t.default)})),e}),[t]);function c(){const e=s.current,t=Math.max(e.contentDocument.documentElement.offsetHeight,e.contentDocument.body.offsetHeight);e.style.height=`${t}px`}const d=(0,O.useCallback)((0,Wc.useThrottle)(((e,t,n)=>{e&&o.current&&R()({path:"lazy-blocks/v1/block-constructor-preview",method:"POST",data:{context:n,attributes:t,block:e}}).then((({response:e,error:t,error_code:n})=>{o.current&&i(t?"lazy_block_no_render_callback"===n?"":`<pre>${e}</pre>`:e)})).catch((()=>{o.current&&i((0,B.__)("Error: Could not generate the preview.","lazy-blocks"))}))}),2e3),[]);return(0,O.useEffect)((()=>{const e=a.current,t=s.current;return()=>{e.disconnect(),t.removeEventListener("load",c),o.current=!1}}),[]),(0,O.useEffect)((()=>{const e=l();d(t,e,n)}),[t,n,l,d]),(0,O.createElement)("div",{className:"lzb-constructor-code-preview"},(0,O.createElement)(P.PanelBody,null,(0,O.createElement)("h2",null,(0,B.__)("Preview","lazy-blocks"))),(0,O.createElement)(P.PanelBody,null,(0,O.createElement)("iframe",{srcDoc:`\n      <link rel="stylesheet" href="/wp-admin/load-styles.php?load[chunk_0]=common,media,themes" type="text/css" media="all" />\n      <style>\n          html {\n              height: auto;\n          }\n          body {\n              background: #fff !important;\n              overflow: auto;\n          }\n      </style>\n      ${r}\n    `,ref:function(e){if(!e)return;s.current=e;const{IntersectionObserver:t}=e.ownerDocument.defaultView;a.current=new t((([e])=>{e.isIntersecting&&c()}),{threshold:1}),a.current.observe(e),e.addEventListener("load",c)},frameBorder:"0",title:"code-preview"})))}class Gc extends O.Component{constructor(e){super(e),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(){}render(){return this.state.hasError?(0,O.createElement)("div",{style:{margin:"16px"}},(0,B.__)("Error: Could not generate the preview.","lazy-blocks")):this.props.children}}const Uc=Gc;(0,Ts.registerBlockType)("lzb-constructor/main",{title:(0,B.__)("Blocks Constructor","lazy-blocks"),category:"design",supports:{html:!1,className:!1,customClassName:!1,anchor:!1,inserter:!1},edit:function(){const[e,t]=(0,O.useState)("frontend"),{blockData:n}=(0,l.useSelect)((e=>({blockData:e("lazy-blocks/block-data").getBlockData()})),[]),{updateBlockData:r}=(0,l.useDispatch)("lazy-blocks/block-data");return n&&void 0!==n.slug?(0,O.createElement)(O.Fragment,null,(0,O.createElement)(Ms.InspectorControls,null,(0,O.createElement)(K,null,(e=>"control"===e.name?(0,O.createElement)(Nc,null):(0,O.createElement)(O.Fragment,null,(0,O.createElement)(zs,{data:n,updateData:r}),(0,O.createElement)(Es,null),(0,O.createElement)(P.PanelBody,{title:(0,B.__)("Supports","lazy-blocks"),initialOpen:!1},(0,O.createElement)(qs,{data:n,updateData:r})),(0,O.createElement)(P.PanelBody,{title:(0,B.__)("Condition","lazy-blocks"),initialOpen:!1},(0,O.createElement)(Ps,{data:n,updateData:r})))))),(0,O.createElement)("div",{className:"lzb-constructor"},(0,O.createElement)(Ds,{data:n,updateData:r}),(0,O.createElement)(xc,{data:n,updateData:r}),(0,O.createElement)(N,{"no-paddings":!0},(0,O.createElement)(Hc,{data:n,updateData:r,onTabChange:e=>t(e)})),(0,O.createElement)(Uc,null,(0,O.createElement)(N,{"no-paddings":!0},(0,O.createElement)(Bc,{data:n,codeContext:e}))))):(0,O.createElement)("div",{className:"lzb-constructor-loading"},(0,O.createElement)(P.Spinner,null))},save:function(){return null}}),(0,window.wp.plugins.registerPlugin)("lazy-blocks-constructor",{render:function(){const{isSavingPost:e,isAutosavingPost:t,selectedBlock:n,editorSettings:r,editorMode:i,blocks:o,postId:s,blockData:a}=(0,l.useSelect)((e=>{const{isSavingPost:t,isAutosavingPost:n,getCurrentPostId:r,getEditorSettings:i}=e("core/editor"),{getSelectedBlock:o,getBlocks:s}=e("core/block-editor"),{getEditorMode:a}=e("core/edit-post"),{getBlockData:l}=e("lazy-blocks/block-data");return{isSavingPost:t(),isAutosavingPost:n(),selectedBlock:o(),editorSettings:i(),editorMode:a(),blocks:s(),postId:r(),blockData:l()}}),[]),{selectBlock:c,insertBlocks:d,resetBlocks:u}=(0,l.useDispatch)("core/block-editor"),{editPost:p}=(0,l.useDispatch)("core/editor"),{switchEditorMode:h}=(0,l.useDispatch)("core/edit-post");(0,O.useEffect)((()=>{r.richEditingEnabled&&"text"===i&&h()}),[r,i,h]);const g=(0,O.useRef)(!1);(0,O.useEffect)((()=>{g.current||1===o.length&&o[0]&&"lzb-constructor/main"===o[0].name||(g.current=!0,u([]),d((0,Ts.createBlock)("lzb-constructor/main")),g.current=!1)}),[o,g,u,d]),(0,O.useEffect)((()=>{if(n&&"lzb-constructor/main"===n.name)return;if(document.querySelector(".editor-post-title__block.is-selected, .editor-post-title.is-selected"))return;let e="";o.forEach((t=>{"lzb-constructor/main"===t.name&&(e=t.clientId)})),e&&c(e)}),[n,o,c]);const m=(0,O.useRef)(!1),_=(0,O.useRef)(!1);(0,O.useEffect)((()=>{a&&Object.keys(a).length&&(e||t||!m.current?m.current=JSON.stringify(a):(clearTimeout(_.current),_.current=setTimeout((()=>{m.current!==JSON.stringify(a)&&p({edited:new Date})}),150)))}),[e,t,a,p]);const f=(0,O.useRef)(!1),b=(0,O.useRef)(!1);return(0,O.useEffect)((()=>{const n=f.current&&!e&&!b.current;f.current=e,b.current=t,n&&R()({path:"/lazy-blocks/v1/update-block-data/",method:"POST",data:{data:a,post_id:s}}).catch((e=>{console.log(e)}))}),[e,t,s,a]),null}})})()})();