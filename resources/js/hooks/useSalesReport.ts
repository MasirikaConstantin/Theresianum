import { useState } from 'react';
import { router } from '@inertiajs/react';
import { SalesReportFilters, SalesStats, Vente } from '@/types/report';

interface UseSalesReportReturn {
  stats: SalesStats | null;
  ventes: Vente[];
  loading: boolean;
  error: string | null;
  generateReport: (filters: SalesReportFilters) => void;
  printReport: (filters: SalesReportFilters) => void;
}

export const useSalesReport = (): UseSalesReportReturn => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (filters: SalesReportFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sales-reports?' + new URLSearchParams(filters as any));
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }

      const data = await response.json();
      
      setStats(data.stats);
      if (data.ventes) {
        setVentes(data.ventes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const printReport = (filters: SalesReportFilters) => {
    const printFilters = { ...filters, type: 'detailed' as const };
    const url = '/api/sales-reports?' + new URLSearchParams(printFilters as any);
    
    window.open(url, '_blank');
  };

  return {
    stats,
    ventes,
    loading,
    error,
    generateReport,
    printReport
  };
};