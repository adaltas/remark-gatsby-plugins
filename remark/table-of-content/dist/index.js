import y from"github-slugger";import{toString as d}from"mdast-util-to-string";import{visit as T}from"unist-util-visit";import*as g from"acorn";import{is_object_literal as _}from"mixme";var E=function({depth_min:t=1,depth_max:n=3,no_annotations:o=!1,no_hash:a=!1,property:r=["toc"],prefix:f=""}={}){let e=new y;return typeof r=="string"&&(r=[r]),function(u,O){let l=[];T(u,"heading",function(s){if(s.depth<t||s.depth>n)return;let p=d(s.children);if(!p)return;let i="",m=s.data?.hProperties;if(!o&&m?.annotation){let c=g.parse("("+m?.annotation+")",{ecmaVersion:"latest"}).body[0].expression;for(let h of c.properties)h.key.name==="id"&&(i=""+h.value.value)}if(!a&&i===""){let c=/^(.*[^\s])\s+#([\w-_]+\s*)$/.exec(p);c&&([,p,i]=c)}i===""&&(i=e.slug(p)),l.push({title:p,depth:s.depth,anchor:f+i})}),P(O.data,r,l,!1)}},A=E,N=(t,n,o=!1)=>{for(let a of n)if(Object.prototype.hasOwnProperty.call(t,a))t=t[a];else{if(o)throw Error("REMARK_TABLE_OF_CONTENT: property does not exists in strict mode.");return}return t},P=(t,n,o,a=!1)=>{if(t===null||typeof t!="object")throw Error("REMARK_TABLE_OF_CONTENT: argument is not an object.");for(let r=0;r<n.length;r++){let f=r===n.length-1,e=n[r];if(f)Object.prototype.hasOwnProperty.call(t,e)?a&&(t[e]=o):t[e]=o;else if(Object.prototype.hasOwnProperty.call(t,e))if(_(t[e]))t=t[e];else throw Error("REMARK_TABLE_OF_CONTENT: cannot overwrite parent property.");else t[e]={},t=t[e]}};export{A as default,N as get,P as set};
