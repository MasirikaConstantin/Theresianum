import{j as e,L as n}from"./app-BiR3H72c.js";import{B as c}from"./button-DfBT4842.js";import{U as i,S as l}from"./breadcrumbs-CfH9HSk2.js";import{c as d}from"./utils-D-KgF5mV.js";import{c as r}from"./createLucideIcon-AVJzoGs5.js";import{L as x}from"./lock-OuqDFEa5.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M12 2v14",key:"jyx4ut"}],["path",{d:"m19 9-7 7-7-7",key:"1oe3oy"}],["circle",{cx:"12",cy:"21",r:"1",key:"o0uj5v"}]],h=r("ArrowDownToDot",m);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]],p=r("Monitor",f);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]],y=r("UserRound",u);function b({title:o,description:s}){return e.jsxs("header",{children:[e.jsx("h3",{className:"mb-0.5 text-base font-medium",children:o}),s&&e.jsx("p",{className:"text-sm text-muted-foreground",children:s})]})}function j({title:o,description:s}){return e.jsxs("div",{className:"mb-8 space-y-0.5",children:[e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:o}),s&&e.jsx("p",{className:"text-sm text-muted-foreground",children:s})]})}const g=[{title:"Profil",href:"/settings/profile",icon:y},{title:"Mot de passe",href:"/settings/password",icon:x},{title:"Apparence",href:"/settings/appearance",icon:p},{title:"Autres Données",href:"/settings/other-data",icon:h},{title:"Mon Compte",href:"/mon_compte",icon:i}];function L({children:o}){if(typeof window>"u")return null;const s=window.location.pathname;return e.jsxs("div",{className:"px-4 py-6",children:[e.jsx(j,{title:"Paramètres",description:"Gestion de votre profil et paramètres"}),e.jsxs("div",{className:"flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12",children:[e.jsx("aside",{className:"w-full max-w-xl lg:w-48",children:e.jsx("nav",{className:"flex flex-col space-y-1 space-x-0",children:g.map((t,a)=>e.jsx(c,{size:"lg",variant:"ghost",asChild:!0,className:d("w-full justify-start",{"bg-muted":s===t.href}),children:e.jsxs(n,{href:t.href||"#",prefetch:!0,children:[t.icon&&e.jsx(t.icon,{className:"h-4 w-4"}),t.title]})},`${t.href}-${a}`))})}),e.jsx(l,{className:"my-6 md:hidden"}),e.jsx("div",{className:"flex-1 md:max-w-2xl ",children:e.jsx("section",{className:"max-w-xl space-y-12",children:o})})]})]})}export{b as H,p as M,L as S};
