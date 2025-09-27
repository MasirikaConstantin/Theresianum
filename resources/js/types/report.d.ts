import { Auth, Client } from ".";

export interface SalesReportFilters {
    start_date: string;
    end_date: string;
    user_id?: number;
    succursale_id?: number;
    type?: 'summary' | 'detailed';
  }
  
  export interface SalesStatss {
    total_ventes: number;
    montant_total: number;
    montant_remise: number;
    montant_net: number;
    total_depenses: number;
    benefice_net: number;
    top_items: TopItem[];
    top_services: TopService[];
    top_produits: TopProduit[];
    periode: {
      start: string;
      end: string;
    };
  }
  export interface SalesReportPageProps {
    auth: Auth;
    vendeurs: User[];
    succursales: Succursale[];
    filters: SalesReportFilters;
  }
  
  export interface TopProduit {
    produit_id: number;
    total_quantite: number;
    total_montant: number;
    produit: {
      id: number;
      name: string;
    };
  }
  
  export interface Vente {
    id: number;
    code: string;
    ref: string;
    montant_total: number;
    remise: number;
    mode_paiement: string;
    created_at: string;
    vendeur?: {
      id: number;
      name: string;
    };
    client : Client
    succursale?: {
      id: number;
      nom: string;
    };
    vente_produits: VenteProduit[];
  }
  
  export interface VenteProduit {
    id: number;
    quantite: number;
    prix_unitaire: number;
    montant_total: number;
    service_id?: number;
    produit_id?: number;
    service?: {
      id: number;
      name: string;
    };
    produit?: {
      id: number;
      name: string;
    };
  }

  export interface TopItem {
    type: 'produit' | 'service' | 'inconnu';
    item_id: number | null;
    total_quantite: string | number;
    total_montant: string | number;
    item: {
      id: number;
      name: string;
      description?: string | null;
      prix_vente?: number;
      prix?: number;
      avatar?: string | null;
    } | null;
  }
  
  export interface SalesStats {
    total_ventes: number;
    montant_total: number;
    montant_remise: number;
    montant_net: number;
    total_depenses: number;
    benefice_net: number;
    top_items: TopItem[];
    periode: {
      start: string;
      end: string;
    };
  }