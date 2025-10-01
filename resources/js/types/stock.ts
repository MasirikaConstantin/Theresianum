export interface StockSuccursale {
    id: number;
    produit_id: number;
    succursale_id: number;
    quantite: number;
    quantite_alerte: number;
    actif: boolean;
    ref: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    produit?: {
      id: number;
      name: string;
      code: string;
    };
    succursale?: {
      id: number;
      nom: string;
      adresse: string;
      telephone: string;
    };
  }
  
  export interface StockState {
    data: StockSuccursale[];
    loading: boolean;
    error: string | null;
  }