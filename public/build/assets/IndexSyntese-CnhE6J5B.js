import{a as m,r as p,j as e,H as h}from"./app-BiR3H72c.js";import{f as l}from"./format-B6qNwQQI.js";import{f as n}from"./fr-CLbTb0XB.js";import"./app-BojVexQw.js";function w({auth:b,stats:a,start_date:d,end_date:o,entreprise:s,vendeur:c}){const{props:g}=m(),r=t=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",minimumFractionDigits:2}).format(t).replace("$US","$");p.useEffect(()=>{const t=setTimeout(()=>{window.print()},500);return()=>clearTimeout(t)},[]);const i=t=>l(new Date(t),"PPP",{locale:n});return e.jsxs("div",{className:"container mx-auto p-6 bg-white",children:[e.jsx(h,{title:`Rapport synthétique des ventes ${l(new Date,"PPP",{locale:n})}`}),e.jsxs("div",{className:"no-print flex justify-end gap-2 p-4 mb-4 bg-gray-100 rounded-lg",children:[e.jsx("button",{onClick:()=>window.print(),className:"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",children:"Imprimer"}),e.jsx("button",{onClick:()=>window.close(),className:"px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",children:"Fermer"})]}),e.jsxs("div",{className:"mx-auto max-w-7xl sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"text-center mb-6  border-gray-300 pb-4",children:[e.jsxs("div",{className:"text-center mb-2 border-b pb-4",children:[s.logo&&e.jsx("img",{src:s.logo,alt:"Logo entreprise",className:"h-20 mx-auto mb-2"}),e.jsx("h1",{className:"text-xl font-bold",children:s.name}),e.jsxs("p",{className:"text-xs",children:["RCCM: ",e.jsx("span",{className:"font-bold",children:s.rccm})," | ID National: ",e.jsx("span",{className:"font-bold",children:s.id_national})]}),e.jsxs("p",{className:"text-xs",children:["Adresse: ",e.jsx("span",{className:"font-bold",children:s.address})]}),e.jsxs("p",{className:"text-xs",children:["Tél: ",e.jsx("span",{className:"font-bold",children:s.phone})," | Email: ",e.jsx("span",{className:"font-bold",children:s.email})]})]}),e.jsx("h1",{className:"text-2xl font-bold uppercase",children:"Rapport des Ventes"}),e.jsxs("p",{className:"text-lg",children:["Période du ",i(d)," au ",i(o)]})]}),e.jsxs("ul",{className:"mb-6",children:[c&&e.jsxs("li",{className:"text-lg",children:["Vendeur : ",e.jsx("span",{className:"font-bold",children:c.name})]}),e.jsxs("li",{className:"text-lg",children:["Nombre de Ventes : ",e.jsx("span",{className:"font-bold",children:a.total_ventes})]}),e.jsxs("li",{className:"text-lg",children:["Total Vendue : ",e.jsx("span",{className:"font-bold",children:r(a.montant_total)})]}),e.jsxs("li",{className:"text-lg",children:["Total Dépensé : ",e.jsx("span",{className:"font-bold",children:r(a.total_depenses)})]}),e.jsxs("li",{className:"text-lg",children:["Solde : ",e.jsx("span",{className:"font-bold",children:r(a.benefice_net)})]})]}),e.jsxs("div",{className:" bg-white ",children:[e.jsxs("h3",{className:"mb-4 text-lg font-semibold text-gray-700",children:["Données Quotidiennes (",a.periode.days_count," jours)"]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full divide-y divide-gray-200",children:[e.jsx("thead",{className:"bg-gray-50",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase",children:"Date"}),e.jsx("th",{className:"px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase",children:"Total Ventes"}),e.jsx("th",{className:"px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase",children:"Montant Total"}),e.jsx("th",{className:"px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase",children:"Dépenses"}),e.jsx("th",{className:"px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase",children:"Solde"})]})}),e.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:a.daily_data.map((t,x)=>e.jsxs("tr",{className:"hover:bg-gray-50",children:[e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsx("div",{className:"text-sm font-medium text-gray-900",children:l(new Date(t.date),"PPP",{locale:n})})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-center",children:e.jsx("div",{className:"text-sm text-gray-900",children:t.ventes_count})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-right mr-2",children:e.jsx("div",{className:"text-sm text-green-600 align-center text-align-center ",children:r(t.montant_total)})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-right mr-2",children:e.jsx("div",{className:"text-sm text-red-600",children:r(t.depenses)})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-right mr-2",children:e.jsx("div",{className:`text-sm font-medium ${t.benefice_net>=0?"text-green-600":"text-red-600"}`,children:r(t.benefice_net)})})]},x))})]})})]})]}),e.jsxs("div",{className:"mt-8 pt-18 border-t-2 border-gray-300",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-8",children:[e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{className:"text-sm",children:"Signature Responsable"})})}),e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{className:"text-sm",children:"Cachet & Signature"})})})]}),e.jsx("div",{className:"mt-4 text-right text-xs text-gray-600",children:e.jsxs("p",{children:["Rapport généré le ",l(new Date,"PPPp",{locale:n})]})})]}),e.jsx("style",{children:`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-size: 10pt;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .container {
            width: 100%;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
          }
          th, td {
            padding: 2px 4px;
            border: 1px solid #000;
          }
          th {
            background-color: #f8f9fa !important;
            font-weight: bold;
          }
          .bg-blue-50, .bg-green-50, .bg-red-50, .bg-purple-50, .bg-gray-50 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .break-before {
            page-break-before: always;
          }
          .break-after {
            page-break-after: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
        }
        
        @media screen {
          body {
            background-color: #f5f5f5;
          }
          .container {
            max-width: 1200px;
          }
        }
      `})]})}export{w as default};
