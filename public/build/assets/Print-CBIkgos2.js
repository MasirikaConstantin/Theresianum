import{r as h,j as e,H as b}from"./app-BiR3H72c.js";import{f as c}from"./format-B6qNwQQI.js";import{f as o}from"./fr-CLbTb0XB.js";import"./app-BojVexQw.js";function f({pointages:r,entreprise:s,periode:n}){h.useEffect(()=>{const t=setTimeout(()=>{window.print()},500);return()=>clearTimeout(t)},[]);const x=t=>({present:"Présent",absent:"Absent",retard:"Retard",congé:"En congé",permission:"Permission",mission:"Mission"})[t]||t,m=t=>({present:"text-green-600",absent:"text-red-600",retard:"text-orange-600",congé:"text-blue-600",permission:"text-purple-600",mission:"text-indigo-600"})[t]||"text-gray-600",d=t=>{if(!t)return"-";try{return c(new Date(t),"HH:mm")}catch{return t}},a=t=>{try{return c(new Date(t),"PPP",{locale:o})}catch{return t}};return e.jsxs("div",{className:"p-4 max-w-6xl mx-auto bg-white",children:[e.jsx(b,{children:e.jsx("title",{children:"Pointages"})}),e.jsxs("div",{className:"no-print flex justify-end gap-4 mb-6",children:[e.jsx("button",{onClick:()=>window.print(),className:"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",children:"Imprimer"}),e.jsx("button",{onClick:()=>window.history.back(),className:"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700",children:"Retour"})]}),e.jsxs("div",{className:"text-center mb-8 border-b pb-4",children:[s.logo&&e.jsx("img",{src:s.logo,alt:"Logo entreprise",className:"h-24 mx-auto mb-2"}),e.jsx("h1",{className:"text-2xl font-bold",children:s.name}),e.jsx("p",{className:"text-sm",children:s.address}),e.jsxs("p",{className:"text-sm",children:["Tél: ",s.phone," | Email: ",s.email]}),e.jsx("h2",{className:"text-xl font-bold mt-4",children:"RAPPORT DE POINTAGE"}),n&&e.jsxs("p",{className:"text-sm mt-2",children:["Période: du ",a(n.debut)," au ",a(n.fin)]})]}),e.jsx("div",{className:"mb-6",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Date:  ",e.jsx("span",{className:"font-bold",children:a(r[0].date)})]}),e.jsxs("li",{children:["Nombre total de pointages: ",e.jsx("span",{className:"font-bold",children:r.length})]}),e.jsxs("li",{children:["Nombre de présents: ",e.jsx("span",{className:"font-bold",children:r.filter(t=>t.statut==="present").length})]}),e.jsxs("li",{children:["Nombre d'absents: ",e.jsx("span",{className:"font-bold",children:r.filter(t=>t.statut==="absent").length})]}),e.jsxs("li",{children:["Nombre de retards: ",e.jsx("span",{className:"font-bold",children:r.filter(t=>t.statut==="retard").length})]})]})}),e.jsx("div",{className:"mb-6",children:e.jsxs("table",{className:"w-full border-collapse border",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100",children:[e.jsx("th",{className:"border p-2 text-left",children:"Agent"}),e.jsx("th",{className:"border p-2 text-left",children:"Succursale"}),e.jsx("th",{className:"border p-2 text-left",children:"Date"}),e.jsx("th",{className:"border p-2 text-center",children:"Arrivée"}),e.jsx("th",{className:"border p-2 text-center",children:"Départ"}),e.jsx("th",{className:"border p-2 text-center",children:"Statut"}),e.jsx("th",{className:"border p-2 text-center",children:"Justifié"})]})}),e.jsx("tbody",{children:r.map(t=>{var l,i;return e.jsxs("tr",{className:"hover:bg-gray-50",children:[e.jsx("td",{className:"border p-2",children:e.jsxs("div",{className:"font-medium",children:[t.agent.nom," ",t.agent.postnom," ",t.agent.prenom]})}),e.jsx("td",{className:"border p-2",children:((i=(l=t.agent)==null?void 0:l.succursale)==null?void 0:i.nom)||"-"}),e.jsx("td",{className:"border p-2",children:a(t.date)}),e.jsxs("td",{className:"border p-2 text-center",children:[e.jsx("div",{children:d(t.heure_arrivee)}),t.statut_arrivee&&e.jsxs("div",{className:"text-xs text-gray-500",children:["(",t.statut_arrivee,")"]})]}),e.jsxs("td",{className:"border p-2 text-center",children:[e.jsx("div",{children:d(t.heure_depart)}),t.statut_depart&&e.jsxs("div",{className:"text-xs text-gray-500",children:["(",t.statut_depart,")"]})]}),e.jsx("td",{className:"border p-2 text-center",children:e.jsx("span",{className:`font-medium ${m(t.statut)}`,children:x(t.statut)})}),e.jsx("td",{className:"border p-2 text-center",children:t.statut_arrivee==="a-lheure"&&t.statut_depart==="a-lheure"?e.jsx(e.Fragment,{}):e.jsx(e.Fragment,{children:t.statut==="congé"?e.jsx("span",{className:"text-green-600",children:"✓"}):e.jsx("span",{className:"text-red-600",children:"✗"})})})]},t.id)})})]})}),e.jsxs("div",{className:"mt-12 grid grid-cols-2 gap-8",children:[e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{children:"Signature Responsable RH"})})}),e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsxs("p",{children:["Cachet & Signature ",s.name]})})})]}),e.jsx("div",{className:"mt-8 text-right text-sm",children:e.jsxs("p",{children:["Généré le ",c(new Date,"PPP à HH:mm",{locale:o})]})}),e.jsx("style",{children:`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            font-size: 10pt;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
          }
          th, td {
            padding: 2px 4px;
            border: 1px solid #000;
            vertical-align: top;
          }
          th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          .truncate {
            max-width: none;
            white-space: normal;
          }
        }
      `})]})}export{f as default};
