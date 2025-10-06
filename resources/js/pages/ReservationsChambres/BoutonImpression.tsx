
export default function BoutonImpression() {
    const handlePrint = () => {
      window.print()
    }
  
    return (
      <div className="print:hidden fixed bottom-8 right-8">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition-colors"
        >
          🖨️ Imprimer la facture
        </button>
      </div>
    )
  }