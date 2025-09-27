import{r as b,j as e,H as p}from"./app-BiR3H72c.js";import{f as l}from"./format-B6qNwQQI.js";import{f as r}from"./fr-CLbTb0XB.js";import"./app-BojVexQw.js";const u=({stats:n,ventes:c,filters:d,vendeur:i,succursale:o,entreprise:a,depenses:x})=>{const t=s=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",minimumFractionDigits:2}).format(s).replace("$US","$"),m=s=>l(new Date(s),"PPP",{locale:r});return b.useEffect(()=>{const s=setTimeout(()=>{window.print()},500);return()=>clearTimeout(s)},[]),e.jsxs("div",{className:"container mx-auto p-6 bg-white",children:[e.jsx(p,{title:`Rapport des Ventes ${l(new Date,"PPPpp",{locale:r})}`}),e.jsxs("div",{className:"no-print flex justify-end gap-2 p-4 mb-4 bg-gray-100 rounded-lg",children:[e.jsx("button",{onClick:()=>window.print(),className:"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",children:"Imprimer"}),e.jsx("button",{onClick:()=>window.close(),className:"px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700",children:"Fermer"})]}),e.jsxs("div",{className:"text-center mb-6  border-gray-300 pb-4",children:[e.jsxs("div",{className:"text-center mb-2 border-b pb-4",children:[a.logo&&e.jsx("img",{src:a.logo,alt:"Logo entreprise",className:"h-20 mx-auto mb-2"}),e.jsx("h1",{className:"text-xl font-bold",children:a.name}),e.jsxs("p",{className:"text-xs",children:["RCCM: ",e.jsx("span",{className:"font-bold",children:a.rccm})," | ID National: ",e.jsx("span",{className:"font-bold",children:a.id_national})]}),e.jsxs("p",{className:"text-xs",children:["Adresse: ",e.jsx("span",{className:"font-bold",children:a.address})]}),e.jsxs("p",{className:"text-xs",children:["Tél: ",e.jsx("span",{className:"font-bold",children:a.phone})," | Email: ",e.jsx("span",{className:"font-bold",children:a.email})]})]}),e.jsx("h1",{className:"text-2xl font-bold uppercase",children:"Rapport des Ventes"}),e.jsxs("p",{className:"text-lg",children:["Période du ",m(d.start_date)," au ",m(d.end_date)]}),d.succursale_id&&e.jsxs("p",{className:"text-sm",children:["Succursale: ",e.jsx("span",{className:"font-bold",children:(o==null?void 0:o.nom)||"Non spécifiée"})]}),d.user_id&&e.jsxs("p",{className:"text-sm",children:["Vendeur: ",e.jsx("span",{className:"font-bold",children:(i==null?void 0:i.name)||"Non spécifié"})]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("h2",{className:"text-xl font-bold mb-3",children:"Résumé Statistique"}),e.jsx("div",{className:"",children:e.jsxs("ul",{className:"list-disc list-inside",children:[e.jsxs("li",{children:["Total Ventes: ",e.jsx("span",{className:"font-bold",children:n.total_ventes})]}),e.jsxs("li",{children:["Total Montant: ",e.jsx("span",{className:"font-bold",children:t(n.montant_total)})]}),e.jsxs("li",{children:["Total Dépenses: ",e.jsx("span",{className:"font-bold",children:t(n.total_depenses)})]}),e.jsxs("li",{children:["Benefice Net: ",e.jsx("span",{className:"font-bold",children:t(n.benefice_net)})]})]})})]}),c.length>0&&e.jsxs("div",{className:"mb-6",children:[e.jsxs("h2",{className:"text-xl font-bold mb-3",children:["Détail des Ventes (",c.length,")"]}),e.jsx("div",{className:"space-y-4",children:e.jsxs("table",{className:"border-3 border-black w-full caption-bottom text-sm ",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"w-[100px]",children:"Code "}),e.jsx("th",{children:"Date"}),e.jsx("th",{children:"Client"}),e.jsx("th",{children:"Mode de paiement"}),e.jsx("th",{children:"Total"})]})}),e.jsx("tbody",{children:c.map(s=>{var h;return e.jsxs("tr",{className:"hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",children:[e.jsx("td",{className:"font-medium p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",children:s.code}),e.jsx("td",{children:l(new Date(s.created_at),"PPPp",{locale:r})}),e.jsx("td",{children:((h=s.client)==null?void 0:h.name)||"Aucun"}),e.jsx("td",{children:s.mode_paiement}),e.jsx("td",{className:"text-right font-semibold",children:t(Number(s.montant_total))})]},s.id)})})]})})]}),x.length>0&&e.jsxs("div",{className:"mb-6",children:[e.jsxs("h2",{className:"text-xl font-bold mb-3",children:["Détail des depenses (",x.length,")"]}),e.jsx("div",{className:"space-y-4",children:e.jsxs("table",{className:"border-3 border-black w-full caption-bottom text-sm ",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"w-[100px]",children:"Date "}),e.jsx("th",{children:"Libellé"}),e.jsx("th",{children:"Montant"}),e.jsx("th",{children:"Description"})]})}),e.jsx("tbody",{children:x.map(s=>e.jsxs("tr",{className:"hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",children:[e.jsx("td",{className:"font-medium p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",children:l(new Date(s.created_at),"PPPp",{locale:r})}),e.jsx("td",{children:s.libelle||"Aucun"}),e.jsx("td",{children:t(s.montant)}),e.jsx("td",{className:"font-semibold",children:s.description})]},s.id))})]})})]}),e.jsxs("div",{className:"mt-8 pt-18 border-t-2 border-gray-300",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-8",children:[e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{className:"text-sm",children:"Signature Responsable"})})}),e.jsx("div",{className:"text-center",children:e.jsx("div",{className:"border-t-2 border-black w-3/4 mx-auto pt-2",children:e.jsx("p",{className:"text-sm",children:"Cachet & Signature"})})})]}),e.jsx("div",{className:"mt-4 text-right text-xs text-gray-600",children:e.jsxs("p",{children:["Rapport généré le ",l(new Date,"PPPp",{locale:r})]})})]}),e.jsx("style",{children:`
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
      `})]})};export{u as default};
