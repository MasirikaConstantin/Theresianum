import { useState, useEffect } from 'react';
import axios from 'axios';
import { StockSuccursale, StockState } from '@/types/stock';

export const useStockSuccursales = () => {
  const [state, setState] = useState<StockState>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchStock = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.get('/api/stock-succursales');
      setState({
        data: response.data.data || response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const refetch = () => {
    fetchStock();
  };

  return { ...state, refetch };
};