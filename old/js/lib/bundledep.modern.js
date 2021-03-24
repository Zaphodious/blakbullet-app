const t=new WeakMap,e=e=>"function"==typeof e&&t.has(e),n="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(t,e,n=null)=>{for(;e!==n;){const n=e.nextSibling;t.removeChild(e),e=n}},s={},o={},a=`{{lit-${String(Math.random()).slice(2)}}}`,r=`\x3c!--${a}--\x3e`,l=new RegExp(`${a}|${r}`);class c{constructor(t,e){this.parts=[],this.element=e;const n=[],i=[],s=document.createTreeWalker(e.content,133,null,!1);let o=0,r=-1,c=0;const{strings:u,values:{length:m}}=t;for(;c<m;){const t=s.nextNode();if(null!==t){if(r++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:n}=e;let i=0;for(let t=0;t<n;t++)d(e[t].name,"$lit$")&&i++;for(;i-- >0;){const e=p.exec(u[c])[2],n=e.toLowerCase()+"$lit$",i=t.getAttribute(n);t.removeAttribute(n);const s=i.split(l);this.parts.push({type:"attribute",index:r,name:e,strings:s}),c+=s.length-1}}"TEMPLATE"===t.tagName&&(i.push(t),s.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(a)>=0){const i=t.parentNode,s=e.split(l),o=s.length-1;for(let e=0;e<o;e++){let n,o=s[e];if(""===o)n=h();else{const t=p.exec(o);null!==t&&d(t[2],"$lit$")&&(o=o.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),n=document.createTextNode(o)}i.insertBefore(n,t),this.parts.push({type:"node",index:++r})}""===s[o]?(i.insertBefore(h(),t),n.push(t)):t.data=s[o],c+=o}}else if(8===t.nodeType)if(t.data===a){const e=t.parentNode;null!==t.previousSibling&&r!==o||(r++,e.insertBefore(h(),t)),o=r,this.parts.push({type:"node",index:r}),null===t.nextSibling?t.data="":(n.push(t),r--),c++}else{let e=-1;for(;-1!==(e=t.data.indexOf(a,e+1));)this.parts.push({type:"node",index:-1}),c++}}else s.currentNode=i.pop()}for(const t of n)t.parentNode.removeChild(t)}}const d=(t,e)=>{const n=t.length-e.length;return n>=0&&t.slice(n)===e},u=t=>-1!==t.index,h=()=>document.createComment(""),p=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;class m{constructor(t,e,n){this.__parts=[],this.template=t,this.processor=e,this.options=n}update(t){let e=0;for(const n of this.__parts)void 0!==n&&n.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=n?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),e=[],i=this.template.parts,s=document.createTreeWalker(t,133,null,!1);let o,a=0,r=0,l=s.nextNode();for(;a<i.length;)if(o=i[a],u(o)){for(;r<o.index;)r++,"TEMPLATE"===l.nodeName&&(e.push(l),s.currentNode=l.content),null===(l=s.nextNode())&&(s.currentNode=e.pop(),l=s.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(l.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,o.name,o.strings,this.options));a++}else this.__parts.push(void 0),a++;return n&&(document.adoptNode(t),customElements.upgrade(t)),t}}const f=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t}),v=` ${a} `;class g{constructor(t,e,n,i){this.strings=t,this.values=e,this.type=n,this.processor=i}getHTML(){const t=this.strings.length-1;let e="",n=!1;for(let i=0;i<t;i++){const t=this.strings[i],s=t.lastIndexOf("\x3c!--");n=(s>-1||n)&&-1===t.indexOf("--\x3e",s+1);const o=p.exec(t);e+=null===o?t+(n?v:r):t.substr(0,o.index)+o[1]+o[2]+"$lit$"+o[3]+a}return e+=this.strings[t],e}getTemplateElement(){const t=document.createElement("template");let e=this.getHTML();return void 0!==f&&(e=f.createHTML(e)),t.innerHTML=e,t}}const _=t=>null===t||!("object"==typeof t||"function"==typeof t),y=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class x{constructor(t,e,n){this.dirty=!0,this.element=t,this.name=e,this.strings=n,this.parts=[];for(let t=0;t<n.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new w(this)}_getValue(){const t=this.strings,e=t.length-1,n=this.parts;if(1===e&&""===t[0]&&""===t[1]){const t=n[0].value;if("symbol"==typeof t)return String(t);if("string"==typeof t||!y(t))return t}let i="";for(let s=0;s<e;s++){i+=t[s];const e=n[s];if(void 0!==e){const t=e.value;if(_(t)||!y(t))i+="string"==typeof t?t:String(t);else for(const e of t)i+="string"==typeof e?e:String(e)}}return i+=t[e],i}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class w{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===s||_(t)&&t===this.value||(this.value=t,e(t)||(this.committer.dirty=!0))}commit(){for(;e(this.value);){const t=this.value;this.value=s,t(this)}this.value!==s&&this.committer.commit()}}class N{constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(h()),this.endNode=t.appendChild(h())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=h()),t.__insert(this.endNode=h())}insertAfterPart(t){t.__insert(this.startNode=h()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){if(null===this.startNode.parentNode)return;for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s,t(this)}const t=this.__pendingValue;t!==s&&(_(t)?t!==this.value&&this.__commitText(t):t instanceof g?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):y(t)?this.__commitIterable(t):t===o?(this.value=o,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,n="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=n:this.__commitNode(document.createTextNode(n)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof m&&this.value.template===e)this.value.update(t.values);else{const n=new m(e,t.processor,this.options),i=n._clone();n.update(t.values),this.__commitNode(i),this.value=n}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let n,i=0;for(const s of t)n=e[i],void 0===n&&(n=new N(this.options),e.push(n),0===i?n.appendIntoPart(this):n.insertAfterPart(e[i-1])),n.setValue(s),n.commit(),i++;i<e.length&&(e.length=i,this.clear(n&&n.endNode))}clear(t=this.startNode){i(this.startNode.parentNode,t.nextSibling,this.endNode)}}class b{constructor(t,e,n){if(this.value=void 0,this.__pendingValue=void 0,2!==n.length||""!==n[0]||""!==n[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=n}setValue(t){this.__pendingValue=t}commit(){for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s,t(this)}if(this.__pendingValue===s)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=s}}class $ extends x{constructor(t,e,n){super(t,e,n),this.single=2===n.length&&""===n[0]&&""===n[1]}_createPart(){return new E(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class E extends w{}let A=!1;(()=>{try{const t={get capture(){return A=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class V{constructor(t,e,n){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=n,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;e(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=s,t(this)}if(this.__pendingValue===s)return;const t=this.__pendingValue,n=this.value,i=null==t||null!=n&&(t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive),o=null!=t&&(null==n||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),o&&(this.__options=T(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=s}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const T=t=>t&&(A?{capture:t.capture,passive:t.passive,once:t.once}:t.capture),L=new class{handleAttributeExpressions(t,e,n,i){const s=e[0];return"."===s?new $(t,e.slice(1),n).parts:"@"===s?[new V(t,e.slice(1),i.eventContext)]:"?"===s?[new b(t,e.slice(1),n)]:new x(t,e,n).parts}handleTextExpression(t){return new N(t)}};function S(t){let e=k.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},k.set(t.type,e));let n=e.stringsArray.get(t.strings);if(void 0!==n)return n;const i=t.strings.join(a);return n=e.keyString.get(i),void 0===n&&(n=new c(t,t.getTemplateElement()),e.keyString.set(i,n)),e.stringsArray.set(t.strings,n),n}const k=new Map,M=new WeakMap,C=(t,e,n)=>{let s=M.get(e);void 0===s&&(i(e,e.firstChild),M.set(e,s=new N(Object.assign({templateFactory:S},n))),s.appendInto(e)),s.setValue(t),s.commit()};"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.3.0");const P=(t,...e)=>new g(t,e,"html",L);class O{constructor(t){this.classes=new Set,this.element=t;const e=(t.getAttribute("class")||"").split(/\s+/);for(const t of e)this.classes.add(t)}add(t){this.classes.add(t),this.commit()}remove(t){this.classes.delete(t),this.commit()}commit(){let t="";this.classes.forEach(e=>t+=e+" "),this.element.setAttribute("class",t)}}function H(t){return t.classList||new O(t)}function I(t=1){return new Promise(e=>0==--t?requestAnimationFrame(()=>e()):e(I(t)))}function j(t){let e=t;for(;e=e.parentNode||e.host;)if(e instanceof HTMLElement)return e;return null}function F(t,e,n=!0){return new Promise(i=>{const s=new MutationObserver(async()=>{s.disconnect(),n&&await I(),i()});s.observe(t,{attributes:!0,attributeFilter:["class"]}),e&&e()})}const B=new WeakMap;let W;function R(t=!document.hidden){W=t}R(),document.addEventListener("visibilitychange",()=>R(),!1);const D=new WeakMap;var q,G;function z(t,e){const n=e();for(let t in n)e[t]=n[t];return Object.defineProperty(e,"name",{get:()=>t}),e}function J(t,e){for(var n in e)try{t[n]=e[n].constructor==Object?J(t[n],e[n]):e[n]}catch(i){t[n]=e[n]}return t}!function(t){t.InOut="in-out",t.OutIn="out-in",t.Both="both"}(q||(q={})),function(t){t[t.None=0]="None",t[t.Lock=1]="Lock",t.Auto="auto"}(G||(G={}));const K=z("fade",function(t={}){const{duration:e=500,ease:n="ease-out",opacity:i=0}=t;return J({enter:{active:"fade-enter-active",from:"fade-enter-from",to:"fade-enter-to"},leave:{active:"fade-leave-active",from:"fade-leave-from",to:"fade-leave-to",lock:!0},css:`\n    .fade-leave-active {\n      position: fixed;\n      transition: opacity ${e}ms ${n}, transform ${e}ms ${n};\n    }\n    .fade-enter-active {\n      transition: opacity ${e}ms ${n}, transform ${e}ms ${n};\n    }\n  .fade-enter-from, .fade-leave-to {\n    opacity: ${i};\n  }\n  .fade-enter-to, .fade-leave-from {\n    opacity: 1;\n  }\n  `},t)}),Q={async transition(t,e,n){const{duration:i=n.duration,active:s,from:o,to:a,lock:r}=e,l=function(t){let e=function(t){const e=[];let n=t.startNode.nextSibling;for(;n!==t.endNode;)e.push(n),n=n.nextSibling;return e}(t).filter(t=>{return!("#text"===(e=t).nodeName&&!(null===(n=e.nodeValue)||void 0===n?void 0:n.trim()));var e,n});if(1!=e.length)throw new Error(`lit-transition directive expects exactly one child node,\n      but was passed ${e.map(t=>t.nodeName).join(", ")}`);return e[0]}(t);if(!l)return;let c;r&&(r!==G.Auto||s&&function(t,e){const n=j(t);return!(!n||"absolute"!==(()=>{const t=document.createElement("div"),i=H(t),s=n.shadowRoot||n;var o;o=e,Array.isArray(o)?o.forEach(t=>i.add(t)):i.add(o),s.appendChild(t);const a=window.getComputedStyle(t).position;return s.removeChild(t),a})())&&"relative"===window.getComputedStyle(n).position}(l,s))&&(c=function(t){const e=t.getBoundingClientRect();let n=0,i=0;{let e=t.offsetParent;for(;t&&t!==document&&!(t instanceof DocumentFragment)&&t!==e;)n+=t.offsetTop-(t.scrollTop||0),i+=t.offsetLeft-(t.scrollLeft||0),t=j(t)}return{left:i,top:n,width:e.width,height:e.height}}(l)),await new Promise(async t=>{const e=H(l),n=t=>Array.isArray(t)?t.forEach(t=>e.add(t)):e.add(t),r=t=>Array.isArray(t)?t.forEach(t=>e.remove(t)):e.remove(t);var d,u;function h(e){if(e){if(e.target!==l)return;e.preventDefault(),e.stopPropagation()}["transitionend","transitioncancel","animationend","animationcancel"].filter(t=>!e||t!==e.type).forEach(t=>l.removeEventListener(t,h)),s&&r(s),o&&r(o),a&&r(a),t()}c&&(u=c,(d=l).style.marginLeft="0px",d.style.marginTop="0px",d.style.left=u.left+"px",d.style.top=u.top+"px",d.style.width=u.width+"px",d.style.height=u.height+"px");const p={once:!0};i?setTimeout(h,i):(l.addEventListener("transitionrun",function(){l.addEventListener("transitionend",h,p),l.addEventListener("transitioncancel",h,p)},p),l.addEventListener("animationstart",function(){l.addEventListener("animationend",h,p),l.addEventListener("animationcancel",h,p)},p)),o&&await F(l,()=>n(o)),s&&await F(l,()=>n(s)),o&&r(o),a&&n(a)})},init({data:t,remove:e,add:n,transition:i}){if(t._cssSource!==i.css&&(t.css&&e(t.css),i.css)){t._cssSource=i.css;let e=i.css;e="string"==typeof e?P`<style>${e}</style>`:e,t.css=n(e)}}},U=z("land",function(t={}){const{duration:e=500,ease:n="ease-out",opacity:i=0}=t;return J({enter:{active:"land1-enter-active",from:"land1-enter-from",to:"land1-enter-to"},leave:{active:"land1-leave-active",from:"land1-leave-from",to:"land1-leave-to"},mode:"both",css:`\n      .land1-enter-active {\n        transform-origin: 50% 50%;\n        transition: transform ${e}ms ${n}, opacity ${e}ms ${n};\n      }\n      .land1-leave-active {\n        transform-origin: 50% 50%;\n        position: absolute;\n        transition: transform ${e}ms ${n}, opacity ${e}ms ${n};\n      }\n      .land1-enter-from {\n        opacity: ${i};\n        transform: translate(0px, 0px) scale(3);\n      }\n      .land1-leave-to {\n        transform: translate(0px, 100px);\n        opacity: ${i};\n      }`},t)}),X=z("slide",function(t={}){const{left:e,right:n,up:i,down:s}=t;let o={};e&&(o={x:"-100%",x1:"100%"}),n&&(o={x:"100%",x1:"-100%"}),i&&(o={y:"100%",y1:"-100%"}),s&&(o={y:"-100%",y1:"100%"});let{mode:a,duration:r=500,x:l="100%",y:c="0%",x1:d="",y1:u="",ease:h="ease-out",leavePosition:p="",opacity:m=0}=Object.assign(Object.assign({},o),t);return d=d||l,u=u||c,J({enter:{active:"slide-enter-active",from:"slide-enter-from"},leave:{active:"slide-leave-active",to:"slide-leave-to",lock:G.Auto},css:`\n    .slide-enter-active {\n      transition: transform ${r}ms ${h}, opacity ${r}ms ${h};\n    }\n    .slide-leave-active {\n      position: ${p||(a!==q.OutIn?"absolute":"initial")};\n      transition: transform ${r}ms ${h}, opacity ${r}ms ${h};\n    }\n    .slide-leave-to {\n      opacity: ${m};\n      transform: translate(${l}, ${c});\n    }\n    .slide-enter-from {\n      opacity: ${m};\n      transform: translate(${d}, ${u});\n    }`,mode:a},t)}),Y=(Z=function(t,e=K){return"function"==typeof e&&(e=e()),function(t){return function(e,n){return async i=>{if(!(i instanceof N))throw new Error("The `transition` directive can only be used on nodes");e||(e=P`<div></div>`),"string"!=typeof e&&"number"!=typeof e||(e=P`<div style="display: inline-block">${e}</div>`);const s=B.get(e),{enter:o,leave:a,onEnter:r,onLeave:l,onAfterEnter:c,onAfterLeave:d,mode:u="in-out"}=n;let h=D.get(i);function p(t){const e=new N(i.options);return e.appendIntoPart(i),e.setValue(t),e.commit(),e}function m(t){const{startNode:e,endNode:n}=t;try{e&&t.clear()}catch(n){}e&&e.parentNode&&e.parentNode.removeChild(e),n&&n.parentNode&&n.parentNode.removeChild(n)}if(!W)return h&&h.last&&m(h.last),l&&await l(),d&&await d(),r&&await r(),h&&(h.last=p(e)),void(c&&await c());async function f(e){r&&await r(),o&&await t.transition(e,o,n),c&&await c()}async function v(e){l&&await l(),a&&await t.transition(e,a,n),m(e),d&&await d()}if(h||D.set(i,h={children:new Map,styles:new Map,transition:n}),t.init&&t.init({transition:n,data:h,add:p,remove:m}),h.last&&s&&s===h.name)h.last.setValue(e),h.last.commit();else if(h.name=s,"in-out"===u){const t=h.last;await f(h.last=p(e)),t&&await v(t)}else if("out-in"===u){const t=h.last;t&&await v(t),await f(h.last=p(e))}else h.last&&v(h.last),await f(h.last=p(e))}}}(Q)(t,function(t={}){const{css:e,duration:n,enter:i={},leave:s={},mode:o=q.Both,onAfterEnter:a,onAfterLeave:r,onEnter:l,onLeave:c,skipHidden:d=!0}=t;return{duration:n,skipHidden:d,css:P`<style>${e}</style>`,enter:0!=i&&(Array.isArray(i)||"string"==typeof i?{active:i}:Object.assign({active:"enter-active",from:"enter-from",to:"enter-to"},i)),leave:0!=s&&(Array.isArray(s)||"string"==typeof s?{active:s,lock:!1}:Object.assign({active:"leave-active",from:"leave-from",to:"leave-to",lock:!1},s)),onEnter:l,onLeave:c,onAfterEnter:a,onAfterLeave:r,mode:o}}(e))},(...e)=>{const n=Z(...e);return t.set(n,!0),n});var Z,tt={__proto__:null,mark:function(t,e){return B.set(t,e),t},get TransitionMode(){return q},get GeometryLockMode(){return G},fade:K,land:U,slide:X,transition:Y};export{P as html,C as render,tt as transition};