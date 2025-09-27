import{r as x,j as e,H as p,L as h}from"./app-BiR3H72c.js";import{B as o}from"./button-DfBT4842.js";import{f as l}from"./format-B6qNwQQI.js";import{f as n}from"./fr-CLbTb0XB.js";import"./app-BojVexQw.js";import"./utils-D-KgF5mV.js";function y({pointages:c,agent:d,date:i,entreprise:s,Mois:t,statistiques:a}){const m=r=>r?r.charAt(0).toUpperCase()+r.slice(1):"";return x.useEffect(()=>{const r=setTimeout(()=>{window.print()},500);return()=>clearTimeout(r)},[]),e.jsxs("div",{children:[e.jsx(p,{title:`Pointages ${new Date(i).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric"})}`}),e.jsxs("div",{className:"no-print flex justify-end gap-2 p-6",children:[e.jsx(o,{onClick:()=>window.print(),children:"Imprimer"}),e.jsx(h,{href:route("pointages.agent"),children:e.jsx(o,{variant:"destructive",children:"Fermer"})})]}),e.jsxs("div",{className:"text-center mb-2 border-b pb-4",children:[s.logo&&e.jsx("img",{src:s.logo,alt:"Logo entreprise",className:"h-20 mx-auto mb-2"}),e.jsx("h1",{className:"text-xl font-bold",children:s.name}),e.jsx("p",{className:"text-xs",children:s.address}),e.jsxs("p",{className:"text-xs",children:["Tél: ",s.phone," | Email: ",s.email]}),e.jsx("h2",{className:"text-xl font-bold mt-1 underline",children:"GRILLE DES PRESENCES"}),e.jsxs("p",{className:"text-xs ",children:["Mois de:  ",e.jsxs("span",{className:"font-bold",children:[String(l(t,"MMMM",{locale:n})).toUpperCase()," ",l(t,"yyyy")]})]})]}),e.jsxs("p",{children:["Agent: ",e.jsxs("span",{className:"font-bold",children:[d.nom," ",d.postnom," ",d.prenom]})]}),e.jsxs("p",{children:["Matricule: ",e.jsx("span",{className:"font-bold",children:d.matricule})]}),e.jsxs("table",{className:"table-auto w-full border-collapse border border-gray-300 ",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2 border border-gray-300 text-center",colSpan:2,children:"Date"}),e.jsx("th",{className:"px-4 py-2 border border-gray-300 text-center",children:"Heure d'arrivée"}),e.jsx("th",{className:"px-4 py-2 border border-gray-300 text-center",children:"Heure de départ"})]})}),e.jsx("tbody",{children:c.map(r=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2 border border-gray-300",children:m(l(new Date(r.date),"EEEE",{locale:n}))}),e.jsx("td",{className:"px-4 py-2 border border-gray-300",children:l(new Date(r.date),"d MMMM",{locale:n})}),e.jsx("td",{className:"px-4 py-2 border border-gray-300",children:r.heure_arrivee?r.heure_arrivee.slice(0,5):"-"}),e.jsx("td",{className:"px-4 py-2 border border-gray-300",children:r.heure_depart?r.heure_depart.slice(0,5):"-"})]},r.id))})]}),e.jsx("div",{className:" flex flex-col",children:e.jsxs("ul",{className:"grid grid-cols-2",children:[e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Présents: ",e.jsx("span",{className:"font-bold",children:a.present})]}),e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Absents: ",e.jsx("span",{className:"font-bold",children:a.absent})]}),e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Congés: ",e.jsx("span",{className:"font-bold",children:a.conge})]}),e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Malades: ",e.jsx("span",{className:"font-bold",children:a.malade})]}),e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Formations: ",e.jsx("span",{className:"font-bold",children:a.formation})]}),e.jsxs("li",{className:"border border-gray-300 p-1 m-0",children:["Missions: ",e.jsx("span",{className:"font-bold",children:a.mission})]})]})}),e.jsxs("div",{className:"mt-12 grid grid-cols-2 gap-8",children:[e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{children:"Signature Responsable RH"})})}),e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsxs("p",{children:["Cachet & Signature ",s.name]})})})]}),e.jsx("div",{className:"mt-8 text-right text-sm",children:e.jsxs("p",{children:["Généré le ",l(new Date,"PPP à HH:mm",{locale:n})]})}),e.jsx("style",{children:`
        @media print {
          @page {
            size: A4;
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
            padding: 1px 2px;
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
      `})]})}export{y as default};
